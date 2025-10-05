import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import HomePage from "./HomePage";

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

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Banner rendering
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

  // Test 2: Categories rendering
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
});




