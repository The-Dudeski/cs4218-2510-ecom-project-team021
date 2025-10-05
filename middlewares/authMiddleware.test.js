// Set up environment variable for JWT secret
process.env.JWT_SECRET = 'testsecret';

// Mock dependencies (CommonJS-compatible)
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../models/userModel.js', () => ({
  findById: jest.fn(),
}));

// Import mocked modules and middleware
const JWT = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const { requireSignIn, isAdmin } = require('./authMiddleware.js');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: { authorization: 'fakeToken' } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should verify token and attach decoded user to req', async () => {
    JWT.verify.mockReturnValue({ _id: '123', name: 'Joanna' });

    await requireSignIn(req, res, next);

    expect(JWT.verify).toHaveBeenCalledWith('fakeToken', 'testsecret');
    expect(req.user).toEqual({ _id: '123', name: 'Joanna' });
    expect(next).toHaveBeenCalled();
  });

  it('should deny access to non-admin users', async () => {
    req.user = { _id: '123' };
    userModel.findById.mockResolvedValue({ _id: '123', role: 0 });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'UnAuthorized Access',
    });
  });

  it('should allow admin users', async () => {
    req.user = { _id: '123' };
    userModel.findById.mockResolvedValue({ _id: '123', role: 1 });

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should log error if JWT.verify throws', async () => {
    const error = new Error('Token invalid');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    JWT.verify.mockImplementation(() => {
      throw error;
    });

    await requireSignIn(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle errors during isAdmin check', async () => {
    const error = new Error('DB failure');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    req.user = { _id: '123' };
    userModel.findById.mockRejectedValue(error);

    await isAdmin(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: 'Error in admin middleware',
    });
    expect(next).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

