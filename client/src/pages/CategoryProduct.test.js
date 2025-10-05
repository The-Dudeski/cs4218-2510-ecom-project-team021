import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import CategoryProduct from "./CategoryProduct";

jest.mock("axios");

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe("CategoryProduct Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correct number of products", async () => {
    const products = [
      { _id: "1", name: "Mouse", description: "Wireless mouse", price: 50, slug: "mouse" },
      { _id: "2", name: "Keyboard", description: "Mechanical keyboard", price: 100, slug: "keyboard" },
    ];
    const category = { _id: "c1", name: "Electronics" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/2 result found/i)).toBeInTheDocument();
    });
  });

  it("renders each product in its own card grid", async () => {
    const products = [
      { _id: "1", name: "Mouse", description: "Wireless mouse", price: 50, slug: "mouse" },
      { _id: "2", name: "Keyboard", description: "Mechanical keyboard", price: 100, slug: "keyboard" },
    ];
    const category = { _id: "c1", name: "Electronics" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mouse")).toBeInTheDocument();
      expect(screen.getByText("Keyboard")).toBeInTheDocument();
    });
  });

  it("navigates to correct product page when 'More Details' is clicked", async () => {
    const products = [
      { _id: "1", name: "Mouse", description: "Wireless mouse", price: 50, slug: "mouse" },
    ];
    const category = { _id: "c1", name: "Electronics" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
          <Route path="/product/mouse" element={<div>Mouse Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: /More Details/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Mouse Page")).toBeInTheDocument();
    });
  });

  it("displays correct product info for every card", async () => {
    const products = [
      { _id: "1", name: "Mouse", description: "Wireless mouse", price: 50, slug: "mouse" },
    ];
    const category = { _id: "c1", name: "Electronics" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mouse")).toBeInTheDocument();
      expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
      expect(screen.getByText(/Wireless mouse/)).toBeInTheDocument();
    });
  });

  it("responds to category slug change", async () => {
    const electronics = {
        products: [{ _id: "1", name: "Mouse", description: "Wireless mouse", price: 50, slug: "mouse" }],
        category: { _id: "c1", name: "Electronics" },
    };
    const furniture = {
        products: [{ _id: "2", name: "Chair", description: "Wooden chair", price: 75, slug: "chair" }],
        category: { _id: "c2", name: "Furniture" },
    };

    axios.get
        .mockResolvedValueOnce({ data: electronics })
        .mockResolvedValueOnce({ data: furniture });

    render(
        <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
            <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText("Mouse")).toBeInTheDocument();
        expect(screen.getByText(/Category - Electronics/)).toBeInTheDocument();
    });

    render(
        <MemoryRouter initialEntries={["/category/furniture"]}>
        <Routes>
            <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText("Chair")).toBeInTheDocument();
        expect(screen.getByText(/Category - Furniture/)).toBeInTheDocument();
    });
    });


  it("does not crash if product info is missing", async () => {
    const products = [
      { _id: "1" }, 
    ];
    const category = { _id: "c1", name: "Electronics" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Category - Electronics/)).toBeInTheDocument();
    });
  });

  it("does not call API or crash when slug is missing", async () => {
    render(
      <MemoryRouter initialEntries={["/category"]}>
        <Routes>
          {/* Notice no :slug param here */}
          <Route path="/category" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    // axios.get should never be called
    expect(axios.get).not.toHaveBeenCalled();

    // The base page should still render
    expect(screen.getByText(/Category -/i)).toBeInTheDocument();
    expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
  });

  it("formats price correctly", async () => {
    const products = [
      { _id: "1", name: "Monitor", description: "HD Display", price: 1500, slug: "monitor" },
    ];
    const category = { _id: "c1", name: "Electronics" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/electronics"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\$1,500\.00/)).toBeInTheDocument();
    });
  });
});
