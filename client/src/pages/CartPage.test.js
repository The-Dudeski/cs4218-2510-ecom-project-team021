import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import CartPage from "./CartPage";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";

// Unit Tests
jest.mock("axios");

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);


beforeEach(() => {
  axios.get.mockReset();
  axios.post.mockReset();
});

it("fetches client token on mount", async () => {
  axios.get.mockResolvedValue({ data: { clientToken: "fake-client-token" } });

  await act(async () => {
    renderWithRouter(<CartPage />);
  });

  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
  });
});


jest.mock("../components/Header", () => () => <div data-testid="header" />);
jest.mock("../components/Footer", () => () => <div data-testid="footer" />);
jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
  success: jest.fn(),
}));

const mockRequestPaymentMethod = jest.fn().mockResolvedValue({ nonce: "fake-nonce" });

jest.mock("braintree-web-drop-in-react", () => ({
    __esModule: true,
    default: ({ onInstance }) => {
      const React = require("react");
      React.useEffect(() => {
        onInstance({ requestPaymentMethod: mockRequestPaymentMethod });
      }, []);
      return React.createElement("div", { "data-testid": "dropin" });
    },
  }));
  

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../context/cart", () => {
  let cartState = [];
  const setCart = jest.fn((newCart) => {
    cartState = newCart;
  });
  return {
    useCart: jest.fn(() => [cartState, setCart]),
  };
});

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [
    {
      user: { name: "Joanna", address: "123 Test St" },
      token: "fake-token",
    },
    jest.fn(),
  ]),
}));

describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders cart items and calculates total correctly", () => {
    const { useCart } = require("../context/cart");
    useCart.mockReturnValue([
      [
        { _id: "1", name: "Item 1", description: "desc", price: 10 },
        { _id: "2", name: "Item 2", description: "desc", price: 20 },
      ],
      jest.fn(),
    ]);

    renderWithRouter(<CartPage />);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getAllByText(/Total/i)).toHaveLength(2);
    expect(screen.getByText(/\$30\.00/)).toBeInTheDocument();
  });

  it("removes items when remove button is clicked", () => {
    const mockSetCart = jest.fn();
    const { useCart } = require("../context/cart");
    useCart.mockReturnValue([
      [{ _id: "1", name: "Item 1", description: "desc", price: 10 }],
      mockSetCart,
    ]);

    renderWithRouter(<CartPage />);
    fireEvent.click(screen.getByText("Remove"));

    expect(mockSetCart).toHaveBeenCalledWith([]);
  });

  it("fetches client token on mount", async () => {
    axios.get = jest.fn().mockResolvedValue({ data: { clientToken: "abc123" } });

    renderWithRouter(<CartPage />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });
  });

  it("handles payment successfully", async () => {
    axios.get = jest.fn().mockResolvedValue({ data: { clientToken: "abc123" } });
    axios.post = jest.fn().mockResolvedValue({ data: { success: true } });
  
    const { useCart } = require("../context/cart");
    const mockSetCart = jest.fn();
    useCart.mockReturnValue([
      [{ _id: "1", name: "Item 1", description: "desc", price: 10 }],
      mockSetCart,
    ]);
  
    renderWithRouter(<CartPage />);
  
    await waitFor(() => {
      expect(screen.getByTestId("dropin")).toBeInTheDocument();
    });
  
    const payButton = await screen.findByRole("button", { name: /Make Payment/i });
    await waitFor(() => expect(payButton).not.toBeDisabled());
  
    fireEvent.click(payButton);
  
    await waitFor(() => {
      expect(mockRequestPaymentMethod).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.objectContaining({
          nonce: "fake-nonce",
          cart: expect.any(Array),
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    });
  });
  
  
  it("handles totalPrice error", () => {
    const { useCart } = require("../context/cart");
  
    const badItem = {
      _id: "1",
      name: "Bad Item",
      description: "This description is fine",
      price: 10,
    };
  
    useCart.mockReturnValue([[badItem], jest.fn()]);
  
    const originalToLocaleString = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = () => {
      throw new Error("totalPrice failed");
    };
  
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    renderWithRouter(<CartPage />);
    expect(consoleSpy).toHaveBeenCalled();
  
    consoleSpy.mockRestore();
    Number.prototype.toLocaleString = originalToLocaleString;
  });
  
  it("renders correctly with no clientToken, no auth, and empty cart", () => {
    const { useCart } = require("../context/cart");
    useCart.mockReturnValue([[], jest.fn()]);
    const { useAuth } = require("../context/auth");
    useAuth.mockReturnValue([{}, jest.fn()]);
    renderWithRouter(<CartPage />);
    expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });

  
  it("handles removeCartItem error", () => {
  const { useCart } = require("../context/cart");
  const { useAuth } = require("../context/auth");

  const validCart = [
    {
      _id: "1",
      name: "Item",
      description: "desc",
      price: 10,
    },
  ];

  const mockSetCart = () => {
    throw new Error("removeCartItem failed");
  };

  useCart.mockReturnValue([validCart, mockSetCart]);
  useAuth.mockReturnValue([
    {
      user: { name: "Joanna", address: "123 St" },
      token: "fake-token",
    },
    jest.fn(),
  ]);

  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  renderWithRouter(<CartPage />);

  const removeButton = screen.getByRole("button", { name: /remove/i });
  fireEvent.click(removeButton);

  expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

  consoleSpy.mockRestore();
});

jest.mock("../context/cart");
jest.mock("../context/auth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("CartPage address buttons", () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });
  
    it("navigates to profile when user has address", () => {
      const { useAuth } = require("../context/auth");
      const { useCart } = require("../context/cart");
  
      useAuth.mockReturnValue([
        {
          user: { name: "Joanna", address: "123 St" },
          token: "token123",
        },
        jest.fn(),
      ]);
  
      useCart.mockReturnValue([
        [{ _id: "1", name: "Item", description: "desc", price: 10 }],
        jest.fn(),
      ]);
  
      renderWithRouter(<CartPage />);
  
      const updateBtn = screen.getByRole("button", { name: /update address/i });
      fireEvent.click(updateBtn);
  
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
    });
  
    it("navigates to profile when user has token but no address", () => {
      const { useAuth } = require("../context/auth");
      const { useCart } = require("../context/cart");
  
      useAuth.mockReturnValue([
        {
          user: { name: "Joanna" }, 
          token: "token123",
        },
        jest.fn(),
      ]);
  
      useCart.mockReturnValue([
        [{ _id: "1", name: "Item", description: "desc", price: 10 }],
        jest.fn(),
      ]);
  
      renderWithRouter(<CartPage />);
  
      const updateBtn = screen.getByRole("button", { name: /update address/i });
      fireEvent.click(updateBtn);
  
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
    });   
  });
});
