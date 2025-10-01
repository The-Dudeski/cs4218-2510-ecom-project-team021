import { registerController, loginController, forgotPasswordController, testController } from "./authController.js"
import userModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { beforeEach } from "node:test";

jest.mock("../models/userModel.js")
jest.mock("../helpers/authHelper.js")
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}))

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


describe("loginController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  it("email or password missing", async () => {
    // Arrange
    const req = { body: {
      email: "",
      password: ""
    }};
    const res = mockResponse();

    // Act
    await loginController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });

  });

  it("user not found", async () => {
    // Arrange
    const req = { body: {
      email: "safwan@gmail.com",
      password: "password"
    }};
    const res = mockResponse();
    userModel.findOne.mockResolvedValueOnce(null);

    // Act
    await loginController(req, res);

    // Assert
    expect(userModel.findOne).toHaveBeenCalledWith({email: "safwan@gmail.com"});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registered",
    });
  });

  it("wrong password with 200 error", async () => {
    // Arrange
    const req = { body: {
      email: "safwan@gmail.com",
      password: "wrong"
    }};
    const res = mockResponse();
    const fakeUser = {
      _id: "userid",
      email: "safwan@gmail.com",
      password: "correct"
    };

    userModel.findOne.mockResolvedValueOnce(fakeUser);
    comparePassword.mockResolvedValueOnce(false);

    // Act
    await loginController(req, res);

    // Assert
    expect(comparePassword).toHaveBeenCalledWith("wrong", "correct");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  it("exception caught due to error caught in catch block", async () => {
    // Arrange
    const req = { body: {
      email: "safwan@gmail.com",
      password: "password"
    }};
    const res = mockResponse();

    const fakeErr = new Error("Fake error");
    userModel.findOne.mockRejectedValueOnce(fakeErr);
    
    // Act
    await loginController(req, res);
    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: fakeErr
    });
  });

  it("log in user and return token and payload", async () => {
    // Arrange
    const req = { body: {
      email: "safwan@gmail.com",
      password: "correct"
    }};
    const res = mockResponse();
    const fakeUser = {
      _id: "userid",
      name: "Safwan",
      email: "safwan@gmail.com",
      phone: "123456",
      address: "NUS",
      role: 0,
      password: "hashedcorrect"
    };

    userModel.findOne.mockResolvedValueOnce(fakeUser);
    comparePassword.mockResolvedValueOnce(true);
    JWT.sign.mockReturnValueOnce("faketoken");

    // Act
    await loginController(req, res);

    // Assert
    expect(JWT.sign).toHaveBeenCalledWith(
      { _id: "userid" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: {
        _id: "userid",
        name: "Safwan",
        email: "safwan@gmail.com",
        phone: "123456",
        address: "NUS",
        role: 0,
      },
      token: "faketoken",
    });
  });
});

describe("forgotPasswordController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("missing email", async () => {
    // Arrange
    const req = {
      body : {
        answer: "Football",
        newPassword: "newpassword"
      }
    }
    const res = mockResponse();

    // Act
    await forgotPasswordController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Email is required"
    });
  });

  it("missing answer", async () => {
    // Arrange
    const req = {
      body : {
        email: "safwan@gmail.com",
        newPassword: "newpassword"
      }
    }
    const res = mockResponse();

    // Act
    await forgotPasswordController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Answer is required"
    });
  });

  it("missing new password", async () => {
    // Arrange
    const req = {
      body : {
        email: "safwan@gmail.com",
        answer: "Football",
      }
    }
    const res = mockResponse();

    // Act
    await forgotPasswordController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New Password is required"
    });
  });

  it("user not found", async () => {
    // Arrange
    const req = {
      body : {
        email: "missing@gmail.com",
        answer: "Football",
        newPassword: "newpassword"
      }
    }
    const res = mockResponse();
    userModel.findOne.mockResolvedValueOnce(null);

    // Act
    await forgotPasswordController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email or Answer"
    });
  });

  it("exception caught in catch block", async () => {
    // Arrange
    const req = {
      body : {
        email: "safwan@gmail.com",
        answer: "Football",
        newPassword: "newpassword"
      }
    }
    const res = mockResponse();
    const fakeErr = new Error("Fake Error");

    userModel.findOne.mockRejectedValueOnce(fakeErr);
    
    // Act
    await forgotPasswordController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error: fakeErr
    });
  });

  
  it("successful reset of password", async () => {
    // Arrange
    const req = {
      body : {
        email: "safwan@gmail.com",
        answer: "Football",
        newPassword: "newpassword"
      }
    }
    const res = mockResponse();
    const fakeUser = {
      _id: "userid",
      email: "safwan@gmail.com"
    };

    userModel.findOne.mockResolvedValueOnce(fakeUser);
    hashPassword.mockResolvedValueOnce("newpasswordhash");
    userModel.findByIdAndUpdate.mockResolvedValueOnce({}); // updating here

    // Act
    await forgotPasswordController(req, res);

    // Assert
    expect(hashPassword).toHaveBeenCalledWith("newpassword")
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "userid",
      {
        password: "newpasswordhash"
      }
    )
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });
});

describe("testController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("protected routes returned successfully", async () => {
    // Arrange
    const req = {};
    const res = mockResponse();

    // Act
    testController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith("Protected Routes");
  })

  it("exception caught in catch block", async () => {
    // Arrange
    const req = {};
    const res = {
      send: jest.fn()
    };

    res.send.mockImplementationOnce(() => { throw new Error("error") }).mockImplementationOnce(() => {});

    // Act
    testController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({
      error: new Error("error"),
    });
  })


});




