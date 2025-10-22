import React from "react";
import { render, screen, waitFor, fireEvent} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import HomePage from "./HomePage";
import toast from "react-hot-toast";
import { act } from "@testing-library/react";

// Mock dependencies
jest.mock("axios");
jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout-mock">{children}</div>,
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[], jest.fn()]),
}));
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));


describe("Unit tests - HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the banner image with correct src and alt", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")) {
        return Promise.resolve({ data: { success: true, category: [] } });
      }
      if (url.includes("product-count")) {
        return Promise.resolve({ data: { total: 0 } });
      }
      if (url.includes("product-list")) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    const banner = await waitFor(() => screen.getByAltText("bannerimage"));
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute("src", "/images/Virtual.png");
  });

  it("renders category checkboxes when fetched", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")) {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "1", name: "Electronics" },
              { _id: "2", name: "Clothing" },
            ],
          },
        });
      }
      if (url.includes("product-count")) {
        return Promise.resolve({ data: { total: 0 } });
      }
      if (url.includes("product-list")) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
    });

  });

  it("shows error toast when getAllCategory returns success = false", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")) {
        return Promise.resolve({ data: { success: false, category: [] } });
      }
      if (url.includes("product-count")) {
        return Promise.resolve({ data: { total: 0 } });
      }
      if (url.includes("product-list")) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again."
      )
    );
  });

  it("handles error in getAllCategory gracefully", async () => {
    // Arrange
    axios.get
      .mockRejectedValueOnce(new Error("category fail"))
      .mockResolvedValueOnce({ data: { total: 0 } })
      .mockResolvedValueOnce({ data: { products: [] } });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(toast.error).not.toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
  });

  it("sets total count correctly when fetched", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("product-count")){
        return Promise.resolve({ data: { total: 5 } });
      }

      if (url.includes("get-category")){
        return Promise.resolve({ data: { success: true, category: [] } });
      }

      if (url.includes("product-list")){
        return Promise.resolve({ data: { products: [] } });
      }
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      const btn = screen.queryByRole("button", { name: /loadmore/i });
      expect(btn).not.toBeInTheDocument();
    });
  });

  it("shows toast error when fetching total fails", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("product-count")){
        return Promise.reject(new Error("network fail"));
      }

      if (url.includes("get-category")){
        return Promise.resolve({ data: { success: true, category: [] } });
      }

      if (url.includes("product-list")){
        return Promise.resolve({ data: { products: [] } });
      }
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
  });


  it("handles invalid total value gracefully", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("product-count")){
        return Promise.resolve({ data: { total: "invalid" } });
      }

      if (url.includes("get-category")){
        return Promise.resolve({ data: { success: true, category: [] } });
      }

      if (url.includes("product-list")){
        return Promise.resolve({ data: { products: [] } });
      }
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => expect(toast.error).not.toHaveBeenCalled());
  });

  it("renders all products fetched for current page", async () => {
    // Arrange
    const mockProducts = [
      { _id: "1", name: "Phone", description: "Smartphone", price: 500, slug: "phone" },
      { _id: "2", name: "Laptop", description: "Gaming laptop", price: 1200, slug: "laptop" },
    ];

    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")){
        return Promise.resolve({ data: { success: true, category: [] } });
      }

      if (url.includes("product-count")){
        return Promise.resolve({ data: { total: 2 } });
      }

      if (url.includes("product-list")){
        return Promise.resolve({ data: { products: mockProducts } });
      }
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });
  });

  it("handles error gracefully when fetching products fails", async () => {
    // Arrange
    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")){
        return Promise.resolve({ data: { success: true, category: [] } });
      }

      if (url.includes("product-count")){
        return Promise.resolve({ data: { total: 2 } });
      }

      if (url.includes("product-list")){
        return Promise.reject(new Error("Network Error"));
      }
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to load products. Please refresh the page.")
    );
  });


  it("filters products successfully", async () => {
    // Arrange
    axios.get
      .mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "A" }] } })
      .mockResolvedValueOnce({ data: { total: 1 } })
      .mockResolvedValueOnce({ data: { products: [] } });
    axios.post.mockResolvedValueOnce({
      data: { products: [{ _id: "2", name: "Filtered", description: "Desc", price: 50 }] },
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("A"));
    fireEvent.click(screen.getByText("A"));

    // Assert
    await waitFor(() => expect(screen.getByText("Filtered")).toBeInTheDocument());
  });

  it("handles error when filtering products fails", async () => {
    // Arrange
    axios.get
      .mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "A" }] } })
      .mockResolvedValueOnce({ data: { total: 1 } })
      .mockResolvedValueOnce({ data: { products: [] } });
    axios.post.mockRejectedValueOnce(new Error("filter fail"));

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("A"));
    fireEvent.click(screen.getByText("A"));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to apply filters.")
    );
  });

  it("shows toast when Promise.all fails during initial load", async () => {
    // Arrange
    jest.spyOn(Promise, "all").mockRejectedValueOnce(new Error("init fail"));

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.")
    );

    Promise.all.mockRestore();
  });

  it("triggers filterProduct when radio value changes", async () => {
    // Arrange
    axios.get.mockResolvedValue({
      data: { success: true, category: [] },
    });
    axios.post.mockResolvedValueOnce({
      data: { products: [{ _id: "1", name: "ByPrice", description: "x", price: 50 }] },
    });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Filter By Price"));

    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]);

    // Assert
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledTimes(1)
    );
  });

  it("resets filters successfully", async () => {
    // Arrange
    axios.get
      .mockResolvedValueOnce({ data: { success: true, category: [] } })
      .mockResolvedValueOnce({ data: { total: 1 } })
      .mockResolvedValueOnce({ data: { products: [] } });

    // Act
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const resetBtn = await screen.findByRole("button", { name: /reset filters/i });
    fireEvent.click(resetBtn);

    // Assert
    await waitFor(() => expect(toast.error).not.toHaveBeenCalled());
  });
});

describe("Integration Tests — HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads initial data (categories, total, and products) and displays them together", async () => {
    const mockCategories = [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Books" },
    ];
    const mockProducts = [
      { _id: "p1", name: "Phone", description: "Smartphone", price: 500, slug: "phone" },
      { _id: "p2", name: "Laptop", description: "Gaming", price: 1200, slug: "laptop" },
    ];

    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")) return Promise.resolve({ data: { success: true, category: mockCategories } });
      if (url.includes("product-count")) return Promise.resolve({ data: { total: 2 } });
      if (url.includes("product-list")) return Promise.resolve({ data: { products: mockProducts } });
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("All Products")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });
  });

  it("applies category filter and updates products accordingly", async () => {
    const mockCategories = [{ _id: "1", name: "Electronics" }];
    const mockFiltered = [{ _id: "p99", name: "FilteredPhone", description: "Filtered", price: 300, slug: "filtered" }];

    axios.get
      .mockResolvedValueOnce({ data: { success: true, category: mockCategories } }) 
      .mockResolvedValueOnce({ data: { total: 1 } }) 
      .mockResolvedValueOnce({ data: { products: [] } }); 

    axios.post.mockResolvedValueOnce({ data: { products: mockFiltered } });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const checkbox = await screen.findByText("Electronics");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/product-filters",
        expect.objectContaining({ checked: ["1"], radio: [] })
      );
      expect(screen.getByText("FilteredPhone")).toBeInTheDocument();
    });
  });

  it("adds an item to cart and shows success toast", async () => {
    // Arrange
    const mockProducts = [
      { _id: "p1", name: "Headphones", description: "Noise cancelling", price: 250, slug: "headphones" },
    ];

    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")) return Promise.resolve({ data: { success: true, category: [] } });
      if (url.includes("product-count")) return Promise.resolve({ data: { total: 1 } });
      if (url.includes("product-list")) return Promise.resolve({ data: { products: mockProducts } });
      return Promise.resolve({ data: {} });
    });

    const mockSetCart = jest.fn();
    jest.spyOn(require("../context/cart"), "useCart").mockReturnValue([[], mockSetCart]);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Act: click "ADD TO CART"
    const addButton = await screen.findByRole("button", { name: /add to cart/i });
    fireEvent.click(addButton);

    // Assert: item added to cart and toast shown
    expect(mockSetCart).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("navigates to product page when 'More Details' is clicked", async () => {
    // Arrange
    const mockProducts = [
      { _id: "p2", name: "Monitor", description: "HD", price: 300, slug: "monitor" },
    ];

    axios.get.mockImplementation((url) => {
      if (url.includes("get-category")) return Promise.resolve({ data: { success: true, category: [] } });
      if (url.includes("product-count")) return Promise.resolve({ data: { total: 1 } });
      if (url.includes("product-list")) return Promise.resolve({ data: { products: mockProducts } });
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const moreDetailsBtn = await screen.findByRole("button", { name: /more details/i });
    fireEvent.click(moreDetailsBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/product/monitor");
  });

});