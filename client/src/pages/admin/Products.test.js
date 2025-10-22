import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Products from "./Products";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

// Mocks
jest.mock("axios");
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("Products", () => {
  const mockProducts = [
    {
      _id: "prod1",
      name: "Product A",
      description: "Description A",
      slug: "product-a",
    },
    {
      _id: "prod2",
      name: "Product B",
      description: "Description B",
      slug: "product-b",
    },
  ];

  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product list when products are fetched", async () => {
    axios.get.mockResolvedValue({ data: { products: mockProducts } });
    renderWithRouter(<Products />);

    expect(screen.getByText("All Products List")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument();
      expect(screen.getByText("Product B")).toBeInTheDocument();
      expect(screen.getAllByRole("img")).toHaveLength(2);
    });
  });

  it("renders no products when API returns empty list", async () => {
    axios.get.mockResolvedValue({ data: { products: [] } });
    renderWithRouter(<Products />);

    await waitFor(() => {
      expect(screen.getByText("All Products List")).toBeInTheDocument();
      expect(screen.queryByText("Product A")).not.toBeInTheDocument();
    });
  });

  it("handles error when fetching products fails", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error("Fetch failed"));

    renderWithRouter(<Products />);

    await waitFor(() => {
      expect(screen.getByText("All Products List")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("renders correct product link hrefs", async () => {
    axios.get.mockResolvedValue({ data: { products: mockProducts } });
    renderWithRouter(<Products />);

    const link = await screen.findByRole("link", { name: /Product A/i });
    expect(link).toHaveAttribute("href", "/dashboard/admin/product/product-a");
  });

  it("matches snapshot", async () => {
    axios.get.mockResolvedValue({ data: { products: mockProducts } });
    const { container } = renderWithRouter(<Products />);
    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
