import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";


describe("AdminMenu", () => {
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
