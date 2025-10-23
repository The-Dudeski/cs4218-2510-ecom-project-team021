import { jest } from "@jest/globals";
const fs = await import("fs");

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

import {
    createProductController,
    updateProductController,
    deleteProductController,
} from "./productController.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    jest.clearAllMocks();
    await productModel.deleteMany({});
    await categoryModel.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

function mockRes() {
    return {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };
}

test("createProductController creates a product successfully", async () => {
    const category = await categoryModel.create({
        name: "Electronics",
        slug: "electronics",
    });

    const req = {
        fields: {
            name: "Test Product",
            description: "Test Desc",
            price: 99,
            category: category._id.toString(),
            quantity: 3,
            shipping: true,
        },
        files: {},
    };

    const res = mockRes();

    await createProductController(req, res);

    const saved = await productModel.findOne({ name: "Test Product" });

    expect(saved).not.toBeNull();
    expect(saved.category.toString()).toBe(category._id.toString());
    expect(res.status).toHaveBeenCalledWith(201);
});

test("updateProductController updates an existing product", async () => {
    const category = await categoryModel.create({
        name: "Electronics",
        slug: "electronics",
    });

    const product = await productModel.create({
        name: "Old Product",
        description: "Old Desc",
        price: 10,
        category: category._id,
        quantity: 1,
        slug: "old-product",
    });

    const req = {
        params: { pid: product._id },
        fields: {
            name: "New Product",
            description: "New Desc",
            price: 20,
            category: category._id,
            quantity: 5,
            shipping: true,
        },
        files: {},
    };

    const res = mockRes();

    await updateProductController(req, res);

    const updatedProduct = await productModel.findById(product._id);

    expect(updatedProduct.name).toBe("New Product");
    expect(res.status).toHaveBeenCalledWith(201);
});

test("deleteProductController deletes a product successfully", async () => {
    const category = await categoryModel.create({
        name: "Electronics",
        slug: "electronics",
    });

    const product = await productModel.create({
        name: "Delete Me",
        description: "Delete this product",
        price: 50,
        category: category._id,
        quantity: 2,
        slug: "delete-me",
    });

    const req = {
        params: { pid: product._id },
    };

    const res = mockRes();

    await deleteProductController(req, res);

    const deletedProduct = await productModel.findById(product._id);

    expect(deletedProduct).toBeNull();
    expect(res.status).toHaveBeenCalledWith(200);
});

test("createProductController returns error when required fields are missing", async () => {
    const req = {
        fields: {
            // name missing
            description: "Missing name test",
            price: 99,
            quantity: 1,
            shipping: true,
        },
        files: {},
    };

    const res = mockRes();

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Name is Required" })
    );
});


test("createProductController prevents duplicate product names in same category", async () => {
    const category = await categoryModel.create({
        name: "Books",
        slug: "books",
    });

    // First save
    await productModel.create({
        name: "Harry Potter",
        description: "Magic",
        price: 10,
        category: category._id,
        quantity: 1,
        slug: "harry-potter",
    });

    const req = {
        fields: {
            name: "Harry Potter",
            description: "Duplicate test",
            price: 20,
            category: category._id.toString(),
            quantity: 5,
            shipping: true,
        },
        files: {},
    };

    const res = mockRes();

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Product already exists in this category" })
    );
});


test("updateProductController responds with error if missing required fields", async () => {
    const category = await categoryModel.create({
        name: "Clothes",
        slug: "clothes",
    });

    const product = await productModel.create({
        name: "Shirt",
        description: "Nice shirt",
        price: 25,
        category: category._id,
        quantity: 2,
        slug: "shirt",
    });

    const req = {
        params: { pid: product._id },
        fields: {
            // Missing description
            name: "Updated Shirt",
            price: 40,
            category: category._id.toString(),
            quantity: 3,
            shipping: true,
        },
        files: {},
    };

    const res = mockRes();

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Description is Required" })
    );
});


test("updateProductController returns 500 if given non-existing product id", async () => {
    const req = {
        params: { pid: new mongoose.Types.ObjectId() },
        fields: {
            name: "Ghost",
            description: "Non-existent",
            price: 5,
            category: new mongoose.Types.ObjectId().toString(),
            quantity: 1,
            shipping: true,
        },
        files: {},
    };

    const res = mockRes();

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
    );
});


test("deleteProductController returns 200 even if product does not exist", async () => {
    const req = {
        params: { pid: new mongoose.Types.ObjectId() }, // random ID
    };

    const res = mockRes();

    await deleteProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
    );
});
