import { jest } from '@jest/globals';

jest.unstable_mockModule('braintree', () => ({
  default: {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: {
        generate: jest.fn((_, cb) => cb(null, { clientToken: 'fake-client-token' })),
      },
      transaction: {},
    })),
    Environment: {
      Sandbox: 'sandbox',
    },
  },
}));

const { braintreeTokenController } = await import('./productController.js');

describe('braintreeTokenController', () => {
  it('returns client token on success', async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await braintreeTokenController(req, res);

    expect(res.send).toHaveBeenCalledWith({ clientToken: 'fake-client-token' });
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
