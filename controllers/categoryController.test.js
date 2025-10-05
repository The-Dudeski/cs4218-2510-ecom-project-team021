import { jest } from "@jest/globals";
import {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryCOntroller,
} from "../controllers/categoryController.js";
import categoryModel from "../models/categoryModel.js";

jest.mock("../models/categoryModel.js", () => jest.fn());
jest.mock("slugify", () => jest.fn(() => "test-slug"));

const { default: slugify } = await import("slugify");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
beforeAll(() => {
		jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});


describe("Category Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    categoryModel.findOne = jest.fn();
    categoryModel.findByIdAndUpdate = jest.fn();
    categoryModel.findByIdAndDelete = jest.fn();
    categoryModel.find = jest.fn();
	});

  it("should fail to create category when name is missing", async () => {
    const req = { body: {} };
    const res = mockResponse();

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
  });

  it("should fail to create category when category already exists", async () => {
    const req = { body: { name: "CategoryTest" } };
    const res = mockResponse();

    categoryModel.findOne.mockResolvedValueOnce({ _id: "category1", name: "CategoryTest" });

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Category Already Exists",
    });
  });

  it("should handle database/network error while creating category", async () => {
    const req = { body: { name: "CategoryTest" } };
    const res = mockResponse();

    categoryModel.findOne.mockRejectedValueOnce(new Error("DB error"));

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error in Category",
      })
    );
  });

  it("should update category successfully", async () => {
    const req = { params: { id: "category1" }, body: { name: "UpdatedCategory" } };
    const res = mockResponse();

    slugify.mockReturnValue("updatedcategory");
    categoryModel.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "category1",
      name: "UpdatedCategory",
      slug: "updatedcategory",
    });

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Updated Successfully",
      category: {
        _id: "category1",
        name: "UpdatedCategory",
        slug: "updatedcategory",
      },
    });
  });

  it("should handle error during category update", async () => {
    const req = { params: { id: "category1" }, body: { name: "UpdatedCategory" } };
    const res = mockResponse();

    categoryModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("DB error"));

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error while updating category",
      })
    );
  });

  it("should fetch all categories successfully", async () => {
    const req = {};
    const res = mockResponse();

    categoryModel.find.mockResolvedValueOnce([{ name: "CategoryTest" }]);

    await categoryControlller(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: [{ name: "CategoryTest" }],
    });
  });

  it("should handle error while fetching all categories", async () => {
    const req = {};
    const res = mockResponse();

    categoryModel.find.mockRejectedValueOnce(new Error("DB error"));

    await categoryControlller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error while getting all categories",
      })
    );
  });

  it("should fetch single category successfully", async () => {
    const req = { params: { slug: "test" } };
    const res = mockResponse();

    categoryModel.findOne.mockResolvedValueOnce({ name: "CategoryTest" });

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get SIngle Category SUccessfully",
      category: { name: "CategoryTest" },
    });
  });

  it("should handle error while fetching single category", async () => {
    const req = { params: { slug: "test" } };
    const res = mockResponse();

    categoryModel.findOne.mockRejectedValueOnce(new Error("DB error"));

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error While getting Single Category",
      })
    );
  });

  it("should delete category successfully", async () => {
    const req = { params: { id: "category1" } };
    const res = mockResponse();

    categoryModel.findByIdAndDelete.mockResolvedValueOnce({});

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    });
  });

  it("should handle error while deleting category", async () => {
    const req = { params: { id: "category1" } };
    const res = mockResponse();

    categoryModel.findByIdAndDelete.mockRejectedValueOnce(new Error("DB error"));

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "error while deleting category",
      })
    );
  });
});
