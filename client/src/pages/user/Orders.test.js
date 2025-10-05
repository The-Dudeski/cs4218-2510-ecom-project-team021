import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import Orders from "./Orders";
import { jest } from '@jest/globals';

// Mocks
jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="user-menu">UserMenu</div>
));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

describe("Orders Component", () => {
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing and calls API when token is present", async () => {

    axios.get.mockResolvedValueOnce({ 
      data: {
        success: true,
        orders: [
          {
            _id: "order1",
            status: "Processing",
            buyer: { name: "John Doe" },
            createAt: new Date(),
            payment: { success: true },
            products: [
              {
                _id: "p1",
                name: "Product One",
                description: "Awesome gadget",
                price: 99,
              },
            ],
          },
        ],
      },
    });
    useAuth.mockReturnValue([{ token: "mock-token" }, mockSetAuth]);

    render(<Orders />);

    // Wait for orders to be fetched and rendered
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    // Check heading
    expect(screen.getByText("All Orders")).toBeInTheDocument();

    // Check that product details render
    expect(await screen.findByText("Product One")).toBeInTheDocument();
    expect(screen.getByText(/Awesome gadget/i)).toBeInTheDocument();
    expect(screen.getByText(/Price : 99/)).toBeInTheDocument();

    // Check buyer name and order details
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("does not call API when no token is present", async () => {
    useAuth.mockReturnValue([{ token: null }, mockSetAuth]);

    render(<Orders />);

    // Axios should not be called if token missing
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  it("renders message when there are no orders", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    useAuth.mockReturnValue([{ token: "mock-token" }, mockSetAuth]);

    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Should still render heading even if no orders
    expect(screen.getByText("All Orders")).toBeInTheDocument();

    // There should be no product rendered
    expect(screen.queryByText(/Price/i)).toBeNull();
  });

  it("renders 'Pending' when payment is not successful", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        orders: [
          {
            _id: "order2",
            status: "Pending",
            buyer: { name: "Jane Doe" },
            createdAt: new Date(),
            payment: { success: false },
            products: [
              { _id: "p2", name: "Product Two", description: "Cool gadget", price: 199 },
            ],
          },
        ],
      },
    });
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);

    render(<Orders />);

    const pendingCells = await screen.findAllByText("Pending");
    expect(pendingCells.length).toBeGreaterThan(0);
    expect(pendingCells[0]).toBeInTheDocument();
  });

  it("handles API failure gracefully and triggers catch block", async () => {
    const mockError = new Error("Network Error");
    axios.get.mockRejectedValueOnce(mockError);
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // mock console.error

    render(<Orders />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching orders", mockError);
    });

    consoleSpy.mockRestore();
  });

});
