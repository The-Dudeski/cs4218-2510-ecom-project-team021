import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminMenu from "./AdminMenu";


describe("Unit tests for AdminMenu", () => {
  it("renders the header", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
        render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );

        const expectedLinks = [
            "Create Category",
            "Create Product",
            "Products",
            "Orders",
        ];

        expectedLinks.forEach((text) => {
            expect(screen.getByText(text)).toBeInTheDocument();
        });
    });

  it("each link has the correct path", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Create Category").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/create-category");

    expect(screen.getByText("Create Product").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/create-product");

    expect(screen.getByText("Products").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/products");

    expect(screen.getByText("Orders").closest("a"))
      .toHaveAttribute("href", "/dashboard/admin/orders");
  });

  it("each link has the correct Bootstrap classes", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const links = [
      screen.getByText("Create Category"),
      screen.getByText("Create Product"),
      screen.getByText("Products"),
      screen.getByText("Orders"),
    ];

    links.forEach((link) => {
      expect(link).toHaveClass("list-group-item");
      expect(link).toHaveClass("list-group-item-action");
    });
  });

});

describe("Integration Tests for AdminMenu", () => {
  it("renders full menu and integrates correctly with routing", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
        <Routes>
          <Route
            path="/dashboard/admin/*"
            element={
              <div>
                <AdminMenu />
                <Routes>
                  <Route path="create-category" element={<div>Category Page</div>} />
                  <Route path="create-product" element={<div>Product Page</div>} />
                  <Route path="products" element={<div>Products Page</div>} />
                  <Route path="orders" element={<div>Orders Page</div>} />
                </Routes>
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("navigates correctly when each link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route
            path="/dashboard/admin/*"
            element={
              <div>
                <AdminMenu /> 
                <Routes>
                  <Route path="create-category" element={<div>Category Page</div>} />
                  <Route path="create-product" element={<div>Product Page</div>} />
                  <Route path="products" element={<div>Products Page</div>} />
                  <Route path="orders" element={<div>Orders Page</div>} />
                </Routes>
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create Category"));
    expect(await screen.findByText("Category Page")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Create Product"));
    expect(await screen.findByText("Product Page")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Products"));
    expect(await screen.findByText("Products Page")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Orders"));
    expect(await screen.findByText("Orders Page")).toBeInTheDocument();
  });

  it("ensures all NavLinks render active class when route is active", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/*"
            element={
              <div>
                <AdminMenu />
                <Routes>
                  <Route path="create-product" element={<div>Active Page</div>} />
                  <Route path="create-category" element={<div>Category Page</div>} />
                  <Route path="products" element={<div>Products Page</div>} />
                  <Route path="orders" element={<div>Orders Page</div>} />
                </Routes>
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    const activeLink = screen.getByText("Create Product").closest("a");
    expect(activeLink).toHaveClass("active");
  });
});
