
import { jest } from '@jest/globals';

const mockSale = jest.fn();
const mockSave = jest.fn();
const mockGenerate = jest.fn();
const mockProductSave = jest.fn();
const mockProductModel = jest.fn();

// Mock fs early
jest.unstable_mockModule("fs", () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-photo")),
}));

// Mock productModel
jest.unstable_mockModule("../models/productModel.js", () => ({
  default: jest.fn().mockImplementation((data) => {
    mockProductModel(data);
    return { save: mockProductSave, photo: {} };
  }),
}));

// Mock orderModel
jest.unstable_mockModule("../models/orderModel.js", () => ({
  default: jest.fn().mockImplementation(() => ({
    save: mockSave,
  })),
}));

// Mock braintree
jest.unstable_mockModule("braintree", () => ({
  default: {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: { generate: mockGenerate },
      transaction: { sale: mockSale },
    })),
    Environment: { Sandbox: "sandbox" },
  },
}));

// Import controllers AFTER mocks
const { braintreeTokenController, brainTreePaymentController } = await import("./productController.js");

// braintreeTokenController
describe('braintreeTokenController', () => {
  it("returns client token on success", async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockGenerate.mockImplementation((_, callback) => {
      callback(null, { clientToken: "fake-client-token" });
    });

    await braintreeTokenController(req, res);
    expect(res.send).toHaveBeenCalledWith({ clientToken: "fake-client-token" });
  });

  it('handles error from gateway', async () => {
    jest.resetModules();

    jest.unstable_mockModule('braintree', () => ({
      default: {
        BraintreeGateway: jest.fn().mockImplementation(() => ({
          clientToken: {
            generate: jest.fn((_, cb) => cb(new Error('Braintree error'), null)),
          },
          transaction: {},
        })),
        Environment: { Sandbox: 'sandbox' },
      },
    }));

    const { braintreeTokenController: errorController } = await import('./productController.js');

    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await errorController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });
});

// brainTreePaymentController
describe("brainTreePaymentController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calculates total, processes transaction, saves order, and responds ok", async () => {
    const req = {
      body: {
        nonce: "fake-nonce",
        cart: [{ price: 10 }, { price: 20 }],
      },
      user: { _id: "user123" },
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockSale.mockImplementation((saleParams, callback) => {
      expect(saleParams.amount).toBe(30);
      callback(null, { transaction: "success" });
    });

    await brainTreePaymentController(req, res);

    expect(mockSale).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("handles failed transaction correctly", async () => {
    const req = {
      body: {
        nonce: "fake-nonce",
        cart: [{ price: 50 }],
      },
      user: { _id: "user123" },
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const fakeError = new Error("Transaction failed");

    mockSale.mockImplementation((saleParams, callback) => {
      callback(fakeError, null);
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(fakeError);
    expect(mockSave).not.toHaveBeenCalled();
  });
});

// createProductController
describe("createProductController", () => {
  let createProductController;

  beforeAll(async () => {
    ({ createProductController } = await import("./productController.js"));
  });

  let req;
  let res;

  beforeEach(() => {
    req = {
      fields: {
        name: "Test Product",
        description: "Desc",
        price: 100,
        category: "cat123",
        quantity: 5,
        shipping: true,
      },
      files: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("validates required fields", async () => {
    req.fields.name = "";
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("validates photo size > 1MB", async () => {
    req.files.photo = { size: 2000000 };
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("saves product without photo", async () => {
    await createProductController(req, res);
    expect(mockProductModel).toHaveBeenCalledWith({
      ...req.fields,
      slug: "Test-Product",
    });
    expect(mockProductSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("saves product with photo", async () => {
    req.files.photo = { path: "/fake/path", size: 500, type: "image/png" };

    const { readFileSync } = await import("fs");
    await createProductController(req, res);

    expect(readFileSync).toHaveBeenCalledWith("/fake/path");
    expect(mockProductSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("handles save error gracefully", async () => {
    mockProductSave.mockRejectedValueOnce(new Error("DB error"));
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
