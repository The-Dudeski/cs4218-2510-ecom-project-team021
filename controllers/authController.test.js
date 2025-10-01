import { registerController } from "./authController.js"
import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper.js";

jest.mock("../models/userModel.js")
jest.mock("../helpers/authHelper.js")

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("registerController", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("name is missing", async () => {
    // Arrange
    const req = { body: { 
      email: "safwan@test.com", 
      password: "password", 
      phone: "123456", 
      address: "NUS", 
      answer: "Football" 
    } };

    const res = mockResponse();

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      message: "Name is Required"
    });
  });

  it("email is missing", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan", 
      password: "password", 
      phone: "123456", 
      address: "NUS", 
      answer: "Football" 
    } };
    const res = mockResponse();

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      message: "Email is Required"
    });
  });

  it("password is missing", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan",
      email: "safwan@test.com", 
      phone: "123456", 
      address: "NUS", 
      answer: "Football" 
    } };
    const res = mockResponse();

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      message: "Password is Required"
    });
  });

  it("phone is missing", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan",
      email: "safwan@test.com", 
      password: "password",  
      address: "NUS", 
      answer: "Football" 
    } };
    const res = mockResponse();

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      message: "Phone no. is Required"
    });
  });

  it("address is missing", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan",
      email: "safwan@test.com", 
      password: "password", 
      phone: "123456",  
      answer: "Football" 
    } };
    const res = mockResponse();

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      message: "Address is Required"
    });
  });

  it("answer is missing", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan",
      email: "safwan@test.com", 
      password: "password", 
      phone: "123456", 
      address: "NUS", 
    } };
    const res = mockResponse();

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      message: "Answer is Required"
    });
  });



  it("if user already exists, should return message", async () => {
    // Arrange
    const req = { body: {
      name: "Safwan", 
      email: "safwan@test.com", 
      password: "password", 
      phone: "123456", 
      address: "NUS", 
      answer: "Football" 
    } };
    const res = mockResponse();
    userModel.findOne.mockResolvedValueOnce({ email: "safwan@test.com" });

    // Act
    await registerController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Registered Please Login",
    });
  });

  
  it("user registered successfully", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan",
      email: "safwan@test.com",
      password: "password", 
      phone: "123456", 
      address: "NUS", 
      answer: "Football" 
    } };
    const res = mockResponse();
    userModel.findOne.mockResolvedValueOnce(null); // no existing user
    hashPassword.mockResolvedValueOnce("hashed123");
    userModel.mockImplementationOnce(() => ({
      save: jest.fn().mockResolvedValueOnce({ _id: "1", name: "Safwan" }),
    }));

    // Act
    await registerController(req, res);

    // Assert
    expect(hashPassword).toHaveBeenCalledWith("password");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User Registered Successfully",
      })
    );
  });

  it("Exception throen, when error in the catch block", async () => {
    // Arrange
    const req = { body: { 
      name: "Safwan",
      email: "safwan@test.com",
      password: "password", 
      phone: "123456", 
      address: "NUS", 
      answer: "Football" 
    } };
    const res = mockResponse();

    const fakeErr = new Error("Fake error");
    userModel.findOne.mockRejectedValueOnce(fakeErr);

    // Act
    await registerController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in Registration",
      error: fakeErr,
    });
  });

});