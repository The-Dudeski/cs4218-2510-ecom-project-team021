import { jest } from '@jest/globals';

const mockSale = jest.fn();
const mockSave = jest.fn();
const mockGenerate = jest.fn();
const mockProductSave = jest.fn();
const mockProductModel = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockSelect = jest.fn();

// Mock fs early
jest.unstable_mockModule("fs", () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-photo")),
}));

const fsMock = {
    readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-photo")),
  };
  
  jest.unstable_mockModule("fs", () => fsMock);

// Mock productModel
jest.unstable_mockModule("../models/productModel.js", () => ({
  default: Object.assign(
    jest.fn().mockImplementation((data) => {
      mockProductModel(data);
      return { save: mockProductSave, photo: {} };
    }),
    {
      findByIdAndDelete: mockFindByIdAndDelete,
    }
  ),
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
const {
  braintreeTokenController,
  brainTreePaymentController,
  createProductController,
  deleteProductController,
} = await import("./productController.js");

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
  
    jest.resetModules();
    const { braintreeTokenController: errorController } = await import(`./productController.js?${Date.now()}`);
  
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
    const reqWithPhoto = {
      fields: {
        name: "Test Product",
        description: "Desc",
        price: 100,
        category: "cat123",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: {
          path: "/fake/path",
          size: 500,
          type: "image/png",
        },
      },
    };
  
    await createProductController(reqWithPhoto, res);
  
    expect(fsMock.readFileSync).toHaveBeenCalledWith("/fake/path");
    expect(mockProductSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
  

  it("handles save error", async () => {
    mockProductSave.mockRejectedValueOnce(new Error("DB error"));
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// deleteProductController
describe("deleteProductController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes product by ID and returns success response", async () => {
    const req = { params: { pid: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockFindByIdAndDelete.mockReturnValue({ select: jest.fn().mockResolvedValue({}) });

    await deleteProductController(req, res);

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  it("handles errors", async () => {
    const req = { params: { pid: "999" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const fakeError = new Error("Delete failed");
    mockFindByIdAndDelete.mockImplementation(() => {
      throw fakeError;
    });

    await deleteProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error: fakeError,
    });
  });
});


describe("updateProductController", () => {
    let updateProductController;
    let mockUpdatedProduct;
  
    beforeAll(async () => {
        ({ updateProductController } = await import("./productController.js"));
    });
    
        beforeEach(async () => {  
            jest.clearAllMocks();
    
        mockUpdatedProduct = {
            photo: {},
            save: jest.fn(),
        };
    
        const productModelModule = await import("../models/productModel.js");
        productModelModule.default.findByIdAndUpdate = jest
            .fn()
            .mockResolvedValue(mockUpdatedProduct);
      });
  
    it("validates required fields", async () => {
      const req = {
        params: { pid: "123" },
        fields: {
          name: "", // missing name triggers validation
          description: "desc",
          price: 10,
          category: "cat",
          quantity: 5,
          shipping: true,
        },
        files: {},
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      await updateProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });
  
    it("validates photo size > 1MB", async () => {
      const req = {
        params: { pid: "123" },
        fields: {
          name: "Product",
          description: "desc",
          price: 10,
          category: "cat",
          quantity: 5,
          shipping: true,
        },
        files: { photo: { size: 2000000 } },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      await updateProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
    });
  
    it("updates fields without photo", async () => {
      const req = {
        params: { pid: "123" },
        fields: {
          name: "Updated Product",
          description: "Updated desc",
          price: 50,
          category: "updated-cat",
          quantity: 10,
          shipping: false,
        },
        files: {},
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      await updateProductController(req, res);
  
      const productModelModule = await import("../models/productModel.js");
      expect(productModelModule.default.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          name: "Updated Product",
          description: "Updated desc",
          price: 50,
          category: "updated-cat",
          quantity: 10,
          shipping: false,
          slug: expect.any(String),
        }),
        { new: true }
      );
  
      expect(mockUpdatedProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockUpdatedProduct,
        })
      );
    });
  
    it("updates fields and saves photo when provided", async () => {
      const fsMock = await import("fs");
  
      const req = {
        params: { pid: "123" },
        fields: {
          name: "Updated Product",
          description: "desc",
          price: 10,
          category: "cat",
          quantity: 5,
          shipping: true,
        },
        files: { photo: { path: "/fake/photo", size: 500, type: "image/png" } },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      await updateProductController(req, res);
  
      expect(fsMock.readFileSync).toHaveBeenCalledWith("/fake/photo");
      expect(mockUpdatedProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: mockUpdatedProduct,
        })
      );
    });
  
    it("handles errors gracefully", async () => {
      const req = {
        params: { pid: "123" },
        fields: {
          name: "Product",
          description: "desc",
          price: 10,
          category: "cat",
          quantity: 5,
          shipping: true,
        },
        files: {},
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      const productModelModule = await import("../models/productModel.js");
      productModelModule.default.findByIdAndUpdate.mockRejectedValueOnce(
        new Error("DB error")
      );
  
      await updateProductController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in Updte product",
        })
      );
    });
  });
  