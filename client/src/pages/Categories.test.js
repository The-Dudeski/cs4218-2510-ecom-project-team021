import React from "react";
import { render, screen, within } from "@testing-library/react";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import { BrowserRouter } from "react-router-dom";

// Mocks
jest.mock("../hooks/useCategory");
jest.mock("../context/auth", () => ({
  useAuth: () => [null, jest.fn()],
}));
jest.mock("../context/cart", () => ({
  useCart: () => [[]],
}));
jest.mock("../context/search", () => ({
  useSearch: () => [{ keyword: "" }, jest.fn()],
}));

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Categories page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders layout and title", () => {
    useCategory.mockReturnValue([]);
    renderWithRouter(<Categories />);
    expect(screen.getByText("All Categories")).toBeInTheDocument();
  });

  it("renders category buttons", () => {
    useCategory.mockReturnValue([
      { _id: "1", name: "Books", slug: "books" },
      { _id: "2", name: "Electronics", slug: "electronics" },
    ]);

    renderWithRouter(<Categories />);

    const grid = screen.getByTestId("category-grid");
    const links = within(grid).getAllByRole("link");

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Books");
    expect(links[0]).toHaveAttribute("href", "/category/books");
    expect(links[1]).toHaveTextContent("Electronics");
    expect(links[1]).toHaveAttribute("href", "/category/electronics");
  });

  it("handles empty category list", () => {
    useCategory.mockReturnValue([]);
    renderWithRouter(<Categories />);
    const grid = screen.getByTestId("category-grid");
    expect(within(grid).queryAllByRole("link")).toHaveLength(0);
  });
});
