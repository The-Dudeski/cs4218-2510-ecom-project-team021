import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "./productModel.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("productModel", () => {
  it("saves a valid product", async () => {
    const product = new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "A great product",
      price: 99.99,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      shipping: true,
    });

    const saved = await product.save();
    expect(saved._id).toBeDefined();
    expect(saved.name).toBe("Test Product");
    expect(saved.slug).toBe("test-product");
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
  });

  it("fails when required fields are missing", async () => {
    const product = new productModel({});
    let error;
    try {
      await product.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.slug).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
  });

  it("accepts optional photo and shipping fields", async () => {
    const product = new productModel({
      name: "Photo Product",
      slug: "photo-product",
      description: "With photo",
      price: 50,
      category: new mongoose.Types.ObjectId(),
      quantity: 5,
      photo: {
        data: Buffer.from("fake-image"),
        contentType: "image/png",
      },
      shipping: false,
    });

    const saved = await product.save();
    expect(saved.photo.data).toBeInstanceOf(Buffer);
    expect(saved.photo.contentType).toBe("image/png");
    expect(saved.shipping).toBe(false);
  });
});
