import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import SearchInput from "./SearchInput";

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

let mockValues;
let mockSetValues;

jest.mock("../../context/search", () => ({
  useSearch: () => [mockValues, mockSetValues],
}));

describe("SearchInput component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValues = { keyword: "", results: [] };
    mockSetValues = jest.fn((newVals) => {
      mockValues = newVals;
    });
  });

  it("renders input and button correctly", () => {
    render(<SearchInput />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("updates keyword in context when typing", () => {
    render(<SearchInput />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "monitor" } });

    expect(mockSetValues).toHaveBeenCalledWith({
      keyword: "monitor",
      results: [],
    });
  });

  it("submits form, triggers API call, updates state, and navigates", async () => {
    axios.get.mockResolvedValue({ data: ["mockData"] });

    mockValues = { keyword: "camera", results: [] };

    render(<SearchInput />);
    const form = screen.getByRole("search");

    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/camera");

      expect(mockSetValues).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: "camera" })
      );
      expect(mockSetValues).toHaveBeenCalledWith(
        expect.objectContaining({ results: ["mockData"] })
      );

      expect(mockNavigate).toHaveBeenCalledWith("/search");
    });
  });

  it("handles API error gracefully", async () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error("Network failure"));

    mockValues = { keyword: "printer", results: [] };

    render(<SearchInput />);
    const form = screen.getByRole("search");

    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(expect.any(Error));
    });

    spy.mockRestore();
  });
});