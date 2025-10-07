import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "../models/orderModel.js";

let mongo;

beforeAll(async () => {
  jest.setTimeout(30000);
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { dbName: "testdb" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await Order.deleteMany({});
});

describe("Order Model", () => {
  it("should create an order with default status and timestamps", async () => {
    const orderData = {
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "credit card", amount: 99 },
      buyer: new mongoose.Types.ObjectId(),
    };

    const order = await Order.create(orderData);

    expect(order._id).toBeDefined();
    expect(order.status).toBe("Not Process");
    expect(order.createdAt).toBeInstanceOf(Date);
    expect(order.updatedAt).toBeInstanceOf(Date);
  });

  it("should only allow valid status values", async () => {
    const orderData = {
      products: [new mongoose.Types.ObjectId()],
      payment: {},
      buyer: new mongoose.Types.ObjectId(),
      status: "InvalidStatus",
    };

    await expect(Order.create(orderData)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should store references to users and products", async () => {
    const productId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const orderData = {
      products: [productId],
      payment: { method: "cash" },
      buyer: userId,
    };

    const order = await Order.create(orderData);

    expect(order.products[0]).toEqual(productId);
    expect(order.buyer).toEqual(userId);
  });

  it("should update status and maintain timestamps", async () => {
    const order = await Order.create({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "paypal" },
      buyer: new mongoose.Types.ObjectId(),
    });

    order.status = "Processing";
    const saved = await order.save();

    expect(saved.status).toBe("Processing");
    expect(saved.updatedAt.getTime()).toBeGreaterThan(saved.createdAt.getTime());
  });
});
