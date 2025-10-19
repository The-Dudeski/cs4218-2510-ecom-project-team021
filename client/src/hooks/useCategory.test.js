import { render, screen, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";
import axios from "axios";
import React from "react";

jest.mock("axios");

function TestComponent() {
  const categories = useCategory();
  return (
    <ul>
      {categories.map((cat, index) => (
        <li key={index}>{cat}</li>
      ))}
    </ul>
  );
}

describe("useCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with empty category list", () => {
    axios.get.mockResolvedValueOnce({ data: { category: [] } });
    render(<TestComponent />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("fetches categories and renders them", async () => {
    axios.get.mockResolvedValueOnce({ data: { category: ["Books", "Electronics"] } });
    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByText("Books")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });
});
