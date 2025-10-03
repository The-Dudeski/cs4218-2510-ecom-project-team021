import { getOrdersController, getAllOrdersController, orderStatusController } from "./orderController.js";
import orderModel from "../models/orderModel.js";

// Mock orderModel
jest.mock("../models/orderModel.js");

// Helper to mock responses
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Order Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrdersController", () => {
    
    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const req = { user: null };
      const res = mockResponse();

      // Act
      await getOrdersController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorised user",
      });
    });

    it("should return 200 with user's orders", async () => {
      // Arrange
      const fakeOrders = [{ _id: "1", buyer: "safwan" }];
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeOrders), 
      });

      const req = { user: { _id: "safwan" } };
      const res = mockResponse();


      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => resolve(fakeOrders),
      });

      await getOrdersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        orders: fakeOrders,
      });
    });

    it("should return 500 in case of exception", async () => {
      // Arrange
      orderModel.find.mockImplementation(() => { 
        throw new Error("Fake Error"); 
      });

      const req = { user: { _id: "safwan" } };
      const res = mockResponse();

      // Act
      await getOrdersController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error while getting orders",
      }));
    });
  });

  describe("getAllOrdersController", () => {
    
    it("should return all orders with status 200", async () => {
      // Arrange
      const fakeOrders = [{ _id: "1" }, { _id: "2" }];

      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnValue(fakeOrders),
      });

      const req = {};
      const res = mockResponse();

      // Act
      await getAllOrdersController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        orders: fakeOrders,
      });
    });

    it("should return 500 in the case of exception", async () => {
      // Arrange
      orderModel.find.mockImplementation(() => { 
        throw new Error("Fake error"); 
      });

      const req = {};
      const res = mockResponse();

      // Act
      await getAllOrdersController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error while getting all orders",
      }));
    });
  });

  describe("orderStatusController", () => {
    it("should return 400 if orderId or status is missing", async () => {
      // Arrange
      const req = { params: {}, body: {} };
      const res = mockResponse();

      // Act
      await orderStatusController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Order ID and status are required",
      });
    });

    it("should return 404 if order not found", async () => {
      // Arrange
      orderModel.findByIdAndUpdate.mockResolvedValue(null);

      const req = { params: { orderId: "123" }, body: { status: "shipped" } };
      const res = mockResponse();

      // Act
      await orderStatusController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Order not found",
      });
    });

    it("should return 200 if order updated successfully", async () => {
      // Arrange
      orderModel.findByIdAndUpdate.mockResolvedValue({ _id: "123", status: "shipped" });

      const req = { params: { orderId: "123" }, body: { status: "shipped" } };
      const res = mockResponse();

      // Act
      await orderStatusController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Order status updated successfully",
      });
    });

    it("should return 500 in the case of exception", async () => {
      // Arrange
      orderModel.findByIdAndUpdate.mockImplementation(() => { 
        throw new Error("Fake error"); 
      });

      const req = { params: { orderId: "123" }, body: { status: "shipped" } };
      const res = mockResponse();

      // Act
      await orderStatusController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error while updating order",
      }));
    });
  });
});
