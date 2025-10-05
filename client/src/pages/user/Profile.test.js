import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));
jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="user-menu">Mocked UserMenu</div>
));

describe("Profile Page", () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock user
    useAuth.mockReturnValue([
      {
        user: {
          name: "Safwan Hussein",
          email: "safwan@gmail.com",
          phone: "123456",
          address: "NUS",
        },
      },
      mockSetAuth,
    ]);
  });

  it("renders Layout component", () => {
    // Arrange & Act
    render(<Profile />);

    // Assert
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  it("renders UserMenu component", () => {
    render(<Profile />);
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("renders the USER PROFILE heading", () => {
    render(<Profile />);
    expect(screen.getByRole("heading", { name: /USER PROFILE/i })).toBeInTheDocument();
  });

  it("renders input for name", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Name/i)).toBeInTheDocument();
  });

  it("renders input for email", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Email/i)).toBeInTheDocument();
  });

  it("renders input for password", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Password/i)).toBeInTheDocument();
  });

  it("renders input for phone", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Phone/i)).toBeInTheDocument();
  });

  it("renders input for address", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Address/i)).toBeInTheDocument();
  });

  it("prefills the name input with user name", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Name/i)).toHaveValue("Safwan Hussein");
  });

  it("prefills the email input with user email", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Email/i)).toHaveValue("safwan@gmail.com");
  });

  it("prefills the phone input with user phone", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Phone/i)).toHaveValue("123456");
  });

  it("prefills the address input with user address", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText(/Enter Your Address/i)).toHaveValue("NUS");
  });

  it("shows toast error if password is shorter than 6 characters", async () => {
    render(<Profile />);

    const passwordInput = screen.getByPlaceholderText(/Enter Your Password/i);
    const button = screen.getByRole("button", { name: /update/i });

    // Arrange
    fireEvent.change(passwordInput, { target: { value: "123" } });

    // Act
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Password must be at least 6 characters long.");
    });
    expect(axios.put).not.toHaveBeenCalled();
  });

  it("updates profile successfully and shows success toast", async () => {
    // Arrange
    const updatedUser = {
      name: "Safwan Updated",
      email: "safwan@gmail.com",
      phone: "1234567",
      address: "NTU",
    };

    axios.put.mockResolvedValueOnce({ data: { updatedUser } });

    // Setup localStorage mock
    const mockLS = { user: { name: "Old Name" } };
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(mockLS));
    jest.spyOn(Storage.prototype, "setItem");

    render(<Profile />);

    const passwordInput = screen.getByPlaceholderText(/Enter Your Password/i);
    fireEvent.change(passwordInput, { target: { value: "strongpass" } });

    const button = screen.getByRole("button", { name: /update/i });

    // Act
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Safwan Hussein",
        email: "safwan@gmail.com",
        password: "strongpass",
        phone: "123456",
        address: "NUS",
      });

      expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
      expect(mockSetAuth).toHaveBeenCalledWith(expect.objectContaining({
        user: updatedUser,
      }));
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles server error with toast", async () => {
    axios.put.mockRejectedValueOnce(new Error("Network Error"));
    render(<Profile />);

    const passwordInput = screen.getByPlaceholderText(/Enter Your Password/i);
    fireEvent.change(passwordInput, { target: { value: "strongpass" } });

    const button = screen.getByRole("button", { name: /update/i });

    // Act
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("shows backend error toast when API returns error message", async () => {
    axios.put.mockResolvedValueOnce({ data: { error: "Invalid data" } });

    render(<Profile />);

    const passwordInput = screen.getByPlaceholderText(/Enter Your Password/i);
    fireEvent.change(passwordInput, { target: { value: "strongpass" } });

    const button = screen.getByRole("button", { name: /update/i });

    // Act
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid data");
    });
  });
});


describe("Profile Page, Input Change Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      {
        user: {
          name: "Safwan Hussein",
          email: "safwan@gmail.com",
          phone: "123456",
          address: "NUS",
        },
      },
      jest.fn(),
    ]);
  });

  it("updates the name input value when user types", () => {
    // Arrange
    render(<Profile />);
    const nameInput = screen.getByPlaceholderText(/Enter Your Name/i);

    // Act
    fireEvent.change(nameInput, { target: { value: "Safwan Updated" } });

    // Assert
    expect(nameInput).toHaveValue("Safwan Updated");
  });

  it("updates the email input value when user types", () => {
    // Arrange
    render(<Profile />);
    const emailInput = screen.getByPlaceholderText(/Enter Your Email/i);

    // Act
    fireEvent.change(emailInput, { target: { value: "updated@gmail.com" } });

    // Assert
    expect(emailInput).toHaveValue("updated@gmail.com");
  });

  it("updates the password input value when user types", () => {
    render(<Profile />);
    const passwordInput = screen.getByPlaceholderText(/Enter Your Password/i);

    fireEvent.change(passwordInput, { target: { value: "newpassword" } });

    expect(passwordInput).toHaveValue("newpassword");
  });

  it("updates the phone input value when user types", () => {
    render(<Profile />);
    const phoneInput = screen.getByPlaceholderText(/Enter Your Phone/i);

    fireEvent.change(phoneInput, { target: { value: "987654" } });

    expect(phoneInput).toHaveValue("987654");
  });

  it("updates the address input value when user types", () => {
    render(<Profile />);
    const addressInput = screen.getByPlaceholderText(/Enter Your Address/i);

    fireEvent.change(addressInput, { target: { value: "New Address" } });

    expect(addressInput).toHaveValue("New Address");
  });
});
