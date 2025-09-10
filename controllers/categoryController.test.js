// Unit tests for createCategoryController

// Mock slugify for deterministic slug generation
jest.mock('slugify', () => ({ __esModule: true, default: (s) => `slug-${s}` }));

// Create a comprehensive mock for the Mongoose model used by the controller
const mockSave = jest.fn();

jest.mock('../models/categoryModel.js', () => {
  const findOneMock = jest.fn();

  // Constructor mock that provides an instance save() method
  const ModelMock = function ModelMock(document) {
    // Each save returns a resolved value resembling a created document
    mockSave.mockResolvedValue({ _id: 'mock-id', ...document });
    this.save = mockSave;
  };

  // Static methods used by controller
  ModelMock.findOne = findOneMock;

  return { __esModule: true, default: ModelMock, findOneMock };
});

import { createCategoryController } from './categoryController.js';
import categoryModel, { findOneMock as mockFindOne } from '../models/categoryModel.js';

// Helpers to create mock req/res
const createMockReqRes = (body = {}) => {
  const req = { body };
  const res = {
    statusCode: 0,
    sent: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(payload) {
      this.sent = payload;
      return this;
    },
  };
  return { req, res };
};

describe('createCategoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when name is missing', async () => {
    const { req, res } = createMockReqRes({});

    await createCategoryController(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.sent).toEqual({ message: 'Name is required' });
    expect(mockFindOne).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('returns 200 when category already exists', async () => {
    const { req, res } = createMockReqRes({ name: 'Electronics' });
    mockFindOne.mockResolvedValueOnce({ _id: 'existing-id', name: 'Electronics' });

    await createCategoryController(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ name: 'Electronics' });
    expect(res.statusCode).toBe(200);
    expect(res.sent).toEqual({
      success: true,
      message: 'Category Already Exisits',
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('creates a new category and returns 201', async () => {
    const { req, res } = createMockReqRes({ name: 'Books' });
    mockFindOne.mockResolvedValueOnce(null);

    await createCategoryController(req, res);

    // save should be called via the constructor path
    expect(mockFindOne).toHaveBeenCalledWith({ name: 'Books' });
    expect(mockSave).toHaveBeenCalled();

    expect(res.statusCode).toBe(201);
    expect(res.sent).toEqual({
      success: true,
      message: 'new category created',
      category: { _id: 'mock-id', name: 'Books', slug: 'slug-Books' },
    });
  });
});


