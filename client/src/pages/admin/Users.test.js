import React from "react";
import { render, screen } from "@testing-library/react";
import Users from "./Users";

jest.mock("../../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu">Mocked Admin Menu</div>
));

describe("Users Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    // Arrange and Act
    render(<Users />);

    // Assert
    expect(screen.getByText("All Users")).toBeInTheDocument();
  });

  it("renders Layout with correct title prop", () => {
    // Arrange and Act
    render(<Users />);

    // Assert
    const layout = screen.getByTestId("layout");
    expect(layout).toBeInTheDocument();
    expect(layout.getAttribute("data-title")).toBe("Dashboard - All Users");
  });

  it("renders AdminMenu inside left column", () => {
    // Arrange and Act
    render(<Users />);

    // Assert
    const adminMenu = screen.getByTestId("admin-menu");
    expect(adminMenu).toBeInTheDocument();
    expect(adminMenu).toHaveTextContent("Mocked Admin Menu");
  });

  it("renders correct Bootstrap structure", () => {
    // Arrange and Act
    const { container } = render(<Users />);

    // Assert
    const containerDiv = container.querySelector(".container-fluid");
    const rowDiv = container.querySelector(".row");
    const col3 = container.querySelector(".col-md-3");
    const col9 = container.querySelector(".col-md-9");

    expect(containerDiv).toBeInTheDocument();
    expect(rowDiv).toBeInTheDocument();
    expect(col3).toBeInTheDocument();
    expect(col9).toBeInTheDocument();
  });

  
  it("displays All Users heading", () => {
    // Arrange and Act
    render(<Users />);

    // Assert
    const heading = screen.getByRole("heading", { name: /All Users/i });
    expect(heading).toBeInTheDocument();
  });
});
