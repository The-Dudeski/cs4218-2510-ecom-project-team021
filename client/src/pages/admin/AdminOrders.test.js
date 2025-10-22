import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminOrders from "./AdminOrders";
import axios from "axios";
import { useAuth } from "../../context/auth";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("AdminOrders", () => {
  const mockOrders = [
    {
      _id: "order1",
      status: "Processing",
      buyer: { name: "Alice" },
      createAt: new Date().toISOString(),
      payment: { success: true },
      products: [
        {
          _id: "prod1",
          name: "Product A",
          description: "Description A",
          price: 100,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });
  });

  it("renders orders after fetching", async () => {
    render(<AdminOrders />);
    expect(screen.getByText("All Orders")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Product A")).toBeInTheDocument();
    });
  });

  it("renders status dropdown with correct default", async () => {
    render(<AdminOrders />);
    const defaultStatus = await screen.findByText("Processing");
    expect(defaultStatus).toBeInTheDocument();
  });

  it("calls handleChange when status is changed", async () => {
    axios.put.mockResolvedValue({ data: {} });
    render(<AdminOrders />);

    const dropdownTrigger = await screen.findByText("Processing");
    userEvent.click(dropdownTrigger);

    const shippedOption = await screen.findByText("Shipped");
    userEvent.click(shippedOption);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/order1", {
        status: "Shipped",
      });
      expect(axios.get).toHaveBeenCalledTimes(2); 
    });
  });

  it("does not fetch orders if no auth token", async () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    render(<AdminOrders />);
    expect(screen.getByText("All Orders")).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("handles error in getOrders", async () => {
    axios.get.mockRejectedValue(new Error("Fetch failed"));
    render(<AdminOrders />);
    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });
  });

  it("handles error in handleChange", async () => {
    axios.put.mockRejectedValue(new Error("Update failed"));
    render(<AdminOrders />);

    const dropdownTrigger = await screen.findByText("Processing");
    userEvent.click(dropdownTrigger);

    const shippedOption = await screen.findByText("Shipped");
    userEvent.click(shippedOption);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(screen.getByText("All Orders")).toBeInTheDocument(); 
    });
  });

  it("renders 'Failed' when payment is not successful", async () => {
    const failedOrder = {
      _id: "order2",
      status: "Processing",
      buyer: { name: "Bob" },
      createAt: new Date().toISOString(),
      payment: { success: false },
      products: [
        {
          _id: "prod2",
          name: "Product B",
          description: "Description B",
          price: 200,
        },
      ],
    };
  
    axios.get.mockResolvedValue({ data: [failedOrder] });
    render(<AdminOrders />);
  
    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Product B")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });
  
});
