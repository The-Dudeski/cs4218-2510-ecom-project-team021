const mockSale = jest.fn();
const mockSave = jest.fn();
const mockGenerate = jest.fn();
const mockProductSave = jest.fn();
const mockProductModel = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockSelect = jest.fn();
const mockFindOne = jest.fn();

// Mock fs early
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-photo")),
}));

const fs = require("fs");

// Mock productModel
jest.mock("../models/productModel.js", () => {
  return jest.fn().mockImplementation((data) => {
    mockProductModel(data);
    return { save: mockProductSave, photo: {} };
  });
});

const productModel = require("../models/productModel.js");
productModel.findByIdAndDelete = mockFindByIdAndDelete;
productModel.findByIdAndUpdate = jest.fn();

// Mock orderModel
jest.mock("../models/orderModel.js", () => {
  return jest.fn().mockImplementation(() => ({
    save: mockSave,
  }));
});
const orderModel = require("../models/orderModel.js");

// Mock braintree
jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    clientToken: { generate: mockGenerate },
    transaction: { sale: mockSale },
  })),
  Environment: { Sandbox: "sandbox" },
}));

jest.mock("../models/categoryModel.js", () => ({
  findOne: mockFindOne,
}));

const braintree = require("braintree");
const categoryModel = require("../models/categoryModel.js");

// Import controllers once mocks are set
const {
  braintreeTokenController,
  brainTreePaymentController,
  createProductController,
  deleteProductController,
  updateProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  productCategoryController,
  relatedProductController
} = require("./productController.js");

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

  it("handles error from gateway", async () => {
    mockGenerate.mockImplementation((_, callback) => {
      callback(new Error("Braintree error"), null);
    });

    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await braintreeTokenController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });
    
  it("handles unexpected error in braintreeTokenController", async () => {
    const req = {};
    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  
    mockGenerate.mockImplementation(() => {
      throw new Error("Unexpected failure");
    });
  
    await braintreeTokenController(req, res);
  
    expect(res.send).not.toHaveBeenCalledWith({ clientToken: "fake-client-token" });
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

  it("handles unexpected error in brainTreePaymentController", async () => {
    const req = {
      body: {
        nonce: "fake-nonce",
        cart: [{ price: 10 }],
      },
      user: { _id: "user123" },
    };
  
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  
    mockSale.mockImplementation(() => {
      throw new Error("Unexpected payment error");
    });
  
    await brainTreePaymentController(req, res);
  
    expect(res.status).not.toHaveBeenCalledWith(500); 
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
    productModel.findOne = jest.fn().mockResolvedValue(null);
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
  
    expect(fs.readFileSync).toHaveBeenCalledWith("/fake/path");
    expect(mockProductSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
  
  it("handles save error", async () => {
    mockProductSave.mockRejectedValueOnce(new Error("DB error"));
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("validates missing description", async () => {
    const req = {
      fields: {
        name: "Test Product",
        description: "", 
        price: 100,
        category: "cat123",
        quantity: 5,
        shipping: true,
      },
      files: {},
    };
  
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    
  
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
  });

  it("validates missing price", async () => {
    const req = {
      fields: {
        name: "Test Product",
        description: "Desc",
        price: "", 
        category: "cat123",
        quantity: 5,
        shipping: true,
      },
      files: {},
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
  });
  
  it("validates missing category", async () => {
    const req = {
      fields: {
        name: "Test Product",
        description: "Desc",
        price: 100,
        category: "", 
        quantity: 5,
        shipping: true,
      },
      files: {},
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
  });
  
  it("validates missing quantity", async () => {
    const req = {
      fields: {
        name: "Test Product",
        description: "Desc",
        price: 100,
        category: "cat123",
        quantity: "", 
        shipping: true,
      },
      files: {},
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await createProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
  });

  it("returns 409 if product already exists", async () => {
    productModel.findOne = jest.fn().mockResolvedValue({ _id: "existing123" });
  
    await createProductController(req, res);
  
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Product already exists in this category",
    });
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

describe("getProductController", () => {
  it("returns products successfully", async () => {
    const mockProducts = [{ name: "A" }, { name: "B" }];
    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await getProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, products: mockProducts })
    );
  });

  it("handles error", async () => {
    productModel.find = jest.fn().mockImplementation(() => {
      throw new Error("DB error");
    });

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await getProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getSingleProductController", () => {
  it("returns single product", async () => {
    productModel.findOne = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue({ name: "Product A" }),
    });

    const req = { params: { slug: "product-a" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await getSingleProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("handles error", async () => {
    productModel.findOne = jest.fn().mockImplementation(() => {
      throw new Error("DB error");
    });

    const req = { params: { slug: "product-a" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await getSingleProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("productPhotoController", () => {
  it("returns photo if available", async () => {
    productModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        photo: { data: Buffer.from("img"), contentType: "image/png" },
      }),
    });

    const req = { params: { pid: "123" } };
    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await productPhotoController(req, res);
    expect(res.set).toHaveBeenCalledWith("Content-type", "image/png");
    expect(res.send).toHaveBeenCalledWith(Buffer.from("img"));
  });

  it("handles error", async () => {
    productModel.findById = jest.fn().mockImplementation(() => {
      throw new Error("DB error");
    });

    const req = { params: { pid: "123" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productPhotoController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("does nothing if product has no photo data", async () => {
    productModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        photo: { data: null, contentType: "image/png" },
      }),
    });
  
    const req = { params: { pid: "123" } };
    const res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  
    await productPhotoController(req, res);
  
    expect(res.set).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});

describe("updateProductController", () => {
  let mockUpdatedProduct;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatedProduct = { photo: {}, save: jest.fn() };
    productModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);
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
      error: "photo is required and should be less then 1mb",
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

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
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

    expect(fs.readFileSync).toHaveBeenCalledWith("/fake/photo");
    expect(mockUpdatedProduct.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
  
  it("handles database error", async () => {
    productModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("DB error"));
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error in updating product",
      })
    );
  });

  it("validates missing description", async () => {
    const req = {
      params: { pid: "123" },
      fields: {
        name: "Product",
        description: "", 
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
    expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
  });
  
  it("validates missing price", async () => {
    const req = {
      params: { pid: "123" },
      fields: {
        name: "Product",
        description: "desc",
        price: "", 
        category: "cat",
        quantity: 5,
        shipping: true,
      },
      files: {},
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
  });
  
  it("validates missing category", async () => {
    const req = {
      params: { pid: "123" },
      fields: {
        name: "Product",
        description: "desc",
        price: 10,
        category: "", 
        quantity: 5,
        shipping: true,
      },
      files: {},
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
  });
  
  it("validates missing quantity", async () => {
    const req = {
      params: { pid: "123" },
      fields: {
        name: "Product",
        description: "desc",
        price: 10,
        category: "cat",
        quantity: "", 
        shipping: true,
      },
      files: {},
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
  });
  
});

describe("productFiltersController", () => {
  it("returns filtered products", async () => {
    productModel.find = jest.fn().mockResolvedValue([{ name: "Filtered" }]);

    const req = { body: { checked: ["cat1"], radio: [10, 50] } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productFiltersController(req, res);
    expect(productModel.find).toHaveBeenCalledWith({
      category: ["cat1"],
      price: { $gte: 10, $lte: 50 },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("handles error", async () => {
    productModel.find = jest.fn().mockRejectedValue(new Error("Filter error"));
    const req = { body: { checked: [], radio: [] } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productFiltersController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("productCountController", () => {
  it("returns product count", async () => {
    productModel.find = jest.fn().mockReturnValue({
      estimatedDocumentCount: jest.fn().mockResolvedValue(42),
    });

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productCountController(req, res);
    expect(res.send).toHaveBeenCalledWith({ success: true, total: 42 });
  });

  it("handles error", async () => {
    productModel.find = jest.fn().mockReturnValue({
      estimatedDocumentCount: jest.fn().mockRejectedValue(new Error("Count error")),
    });

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productCountController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});


describe("productListController", () => {
  it("returns paginated products", async () => {
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ name: "Paged" }]),
    });

    const req = { params: { page: "2" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productListController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("handles error", async () => {
    productModel.find = jest.fn().mockImplementation(() => {
      throw new Error("Pagination error");
    });

    const req = { params: { page: "1" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productListController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("defaults to page 1 when no page param is provided", async () => {
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ name: "Default Page Product" }]),
    });
  
    const req = { params: {} }; 
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
    await productListController(req, res);
  
    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        products: expect.any(Array),
      })
    );
  });
});


describe("searchProductController", () => {
  it("returns search results", async () => {
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue([{ name: "Match" }]),
    });

    const req = { params: { keyword: "test" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

    await searchProductController(req, res);
    expect(res.json).toHaveBeenCalledWith([{ name: "Match" }]);
  });

  it("handles error", async () => {
    productModel.find = jest.fn().mockImplementation(() => {
      throw new Error("Search error");
    });

    const req = { params: { keyword: "fail" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await searchProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("productCategoryController", () => {
  it("returns products by category", async () => {
    const mockCategory = { _id: "cat1" };
    categoryModel.findOne = jest.fn().mockResolvedValue(mockCategory);
    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue([{ name: "CatProduct" }]),
    });

    const req = { params: { slug: "cat-slug" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("handles error", async () => {
    categoryModel.findOne = jest.fn().mockRejectedValue(new Error("Category error"));

    const req = { params: { slug: "cat-slug" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await productCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});



describe("relatedProductController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns related products successfully", async () => {
    productModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([{ name: "Related Product" }]),
    });

    const req = { params: { pid: "123", cid: "cat1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "cat1",
      _id: { $ne: "123" },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: [{ name: "Related Product" }],
    });
  });

  it("handles error when fetching related products fails", async () => {
    productModel.find = jest.fn().mockImplementation(() => {
      throw new Error("Related fetch error");
    });

    const req = { params: { pid: "123", cid: "cat1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await relatedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while geting related product",
      error: expect.any(Error),
    });
  });
});