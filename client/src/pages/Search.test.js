import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ProductDetails from "./ProductDetails";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";

jest.mock("axios");
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock("react-hot-toast", () => ({ success: jest.fn() }));
jest.mock("./../components/Layout", () => ({ children }) => <div>{children}</div>);

const product = {
  _id: "p1",
  slug: "cool-gadget",
  name: "Cool Gadget Pro",
  description: "A fantastic new device.",
  price: 500.5,
  category: { _id: "c1", name: "Electronics" },
};

const related = [
  { _id: "r1", slug: "small-accessory", name: "Small Accessory", description: "Useful gadget add-on", price: 10 },
];

describe("ProductDetails", () => {
  let setCart, navigate;

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ slug: product.slug });
    setCart = jest.fn();
    navigate = jest.fn();
    useCart.mockReturnValue([[], setCart]);
    useNavigate.mockReturnValue(navigate);
  });

  it("shows product details and related products", async () => {
    axios.get.mockImplementation(url => {
      if (url.includes("get-product")) return Promise.resolve({ data: { product } });
      if (url.includes("related-product")) return Promise.resolve({ data: { products: related } });
      return Promise.reject();
    });

    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText("Name : Cool Gadget Pro")).toBeInTheDocument();
      expect(screen.getByText(/Price/i)).toBeInTheDocument();
      expect(screen.getByText(/\$500.50/)).toBeInTheDocument();
      expect(screen.getByText("Category : Electronics")).toBeInTheDocument();
      expect(screen.getByText("Small Accessory")).toBeInTheDocument();
    });
  });

  it("shows fallback when no related products", async () => {
    axios.get.mockResolvedValueOnce({ data: { product } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
    });
  });

  it("navigates when 'More Details' is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { product } });
    axios.get.mockResolvedValueOnce({ data: { products: related } });

    render(<ProductDetails />);

    const button = await screen.findByText("More Details");
    userEvent.click(button);

    expect(navigate).toHaveBeenCalledWith(`/product/${related[0].slug}`);
  });

  it("handles product fetch error", async () => {
    axios.get.mockRejectedValueOnce(new Error("fail"));

    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.queryByText("Cool Gadget Pro")).not.toBeInTheDocument();
    });
  });
});
