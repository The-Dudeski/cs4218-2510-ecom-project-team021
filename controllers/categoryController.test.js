// Unit tests for createCategoryController

// Mock slugify for deterministic slug generation
jest.mock('slugify', () => ({ __esModule: true, default: (s) => `slug-${s}` }));

// Create a comprehensive mock for the Mongoose model used by the controller
const mockSave = jest.fn();

jest.mock('../models/categoryModel.js', () => {
  const findOneMock = jest.fn();
  const findByIdAndUpdateMock = jest.fn();
  const findByIdAndDeleteMock = jest.fn();

  // Constructor mock that provides an instance save() method
  const ModelMock = function ModelMock(document) {
    // Each save returns a resolved value resembling a created document
    mockSave.mockResolvedValue({ _id: 'mock-id', ...document });
    this.save = mockSave;
  };

  // Static methods used by controller
  ModelMock.findOne = findOneMock;
  ModelMock.findByIdAndUpdate = findByIdAndUpdateMock;
  ModelMock.findByIdAndDelete = findByIdAndDeleteMock;

  return { __esModule: true, default: ModelMock, findOneMock, findByIdAndUpdateMock, findByIdAndDeleteMock };
});

import { createCategoryController, updateCategoryController, deleteCategoryController } from './categoryController.js';
import categoryModel, { findOneMock as mockFindOne, findByIdAndUpdateMock as mockFindByIdAndUpdate, findByIdAndDeleteMock as mockFindByIdAndDelete } from '../models/categoryModel.js';

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

describe('updateCategoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a category and returns 200', async () => {
    const { req, res } = createMockReqRes(
      // params
      undefined,
      // body will be ignored; we need params and body both
    );

    // craft proper req with params and body
    req.params = { id: 'abc123' };
    req.body = { name: 'NewName' };

    const updatedDoc = { _id: 'abc123', name: 'NewName', slug: 'slug-NewName' };
    mockFindByIdAndUpdate.mockResolvedValueOnce(updatedDoc);

    await updateCategoryController(req, res);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'abc123',
      { name: 'NewName', slug: 'slug-NewName' },
      { new: true }
    );

    expect(res.statusCode).toBe(200);
    expect(res.sent).toEqual({
      success: true,
      messsage: 'Category Updated Successfully',
      category: updatedDoc,
    });
  });

  it('handles errors and returns 500', async () => {
    const { req, res } = createMockReqRes();
    req.params = { id: 'abc123' };
    req.body = { name: 'Broken' };

    const err = new Error('DB failure');
    mockFindByIdAndUpdate.mockRejectedValueOnce(err);

    await updateCategoryController(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.sent).toEqual({
      success: false,
      error: err,
      message: 'Error while updating category',
    });
  });
});

describe('deleteCategoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a category and returns 200', async () => {
    const { req, res } = createMockReqRes();
    req.params = { id: 'abc123' };

    mockFindByIdAndDelete.mockResolvedValueOnce({ _id: 'abc123', name: 'DeletedCategory' });

    await deleteCategoryController(req, res);

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123');
    expect(res.statusCode).toBe(200);
    expect(res.sent).toEqual({
      success: true,
      message: 'Category Deleted Successfully',
    });
  });

  it('handles errors and returns 500', async () => {
    const { req, res } = createMockReqRes();
    req.params = { id: 'abc123' };

    const err = new Error('DB failure');
    mockFindByIdAndDelete.mockRejectedValueOnce(err);

    await deleteCategoryController(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.sent).toEqual({
      success: false,
      message: 'Error while deleting category',
      error: err,
    });
  });
});