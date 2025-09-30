import { jest } from '@jest/globals';

const mockSale = jest.fn();
const mockSave = jest.fn();
const mockGenerate = jest.fn();

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
  

const { braintreeTokenController } = await import('./productController.js');
const { brainTreePaymentController } = await import("./productController.js");


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
            Environment: {
            Sandbox: 'sandbox',
            },
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

describe("brainTreePaymentController", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("calculates total, processes transaction, saves order, and responds ok", async () => {
      const req = {
        body: {
          nonce: "fake-nonce",
          cart: [
            { price: 10 },
            { price: 20 },
          ],
        },
        user: { _id: "user123" },
      };
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      mockSale.mockImplementation((saleParams, callback) => {
        expect(saleParams.amount).toBe(30); // total = 10+20
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
  
      // failed
      mockSale.mockImplementation((saleParams, callback) => {
        callback(fakeError, null);
      });
  
      await brainTreePaymentController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(fakeError);
      expect(mockSave).not.toHaveBeenCalled();
    });
  });