const { render, screen, waitFor } = require("@testing-library/react");
const axios = require("axios");
const React = require("react");
const Orders = require("./Orders").default;
const { useAuth } = require("../../context/auth");

// Mocks
jest.mock("axios");
jest.mock("../../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../../components/UserMenu", () => {
  const React = require("react");
  return () => React.createElement("div", { "data-testid": "user-menu" }, "UserMenu");
});
jest.mock("../../components/Layout", () => {
  const React = require("react");
  return ({ children }) => React.createElement("div", { "data-testid": "layout" }, children);
});



describe("Data Fetching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls /api/v1/auth/orders when token exists", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: [] } });

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });
  });

  it("does not call /api/v1/auth/orders when token is missing", async () => {
    // Arrange
    useAuth.mockReturnValue([
      { token: null },
      jest.fn()
    ]);

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  it("logs an error when the API call fails", async () => {
    // Arrange
    const mockError = new Error("Network failure");
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockRejectedValueOnce(mockError);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // silence console output

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching orders", mockError);
    });

    consoleSpy.mockRestore();
  });

  it("defaults to empty array when API returns no 'orders' field", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: {} }); // no orders field

    // Act
    const { container } = render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
      // No order rows should render
      const orderRows = container.querySelectorAll("table tbody tr");
      expect(orderRows.length).toBe(0);
    });
  });



});

describe("UI Rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always renders the "All Orders" heading', async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: [] } });

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });
  });

  it("renders safely when product description is missing", async () => {
    // Arrange
    const mockOrders = [
      {
        _id: "o4",
        status: "Delivered",
        buyer: { name: "Chris Lee" },
        createdAt: new Date(),
        payment: { success: true },
        products: [
          {
            _id: "p4",
            name: "Monitor",
            description: null, // no description
            price: 300,
          },
        ],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Monitor")).toBeInTheDocument();
      expect(screen.getByText("Price : 300")).toBeInTheDocument();
    });
  });

  it("renders 'N/A' when createdAt is missing", async () => {
    // Arrange
    const mockOrders = [
      {
        _id: "o3",
        status: "Processing",
        buyer: { name: "Safwan Hussein" },
        createdAt: null,
        payment: { success: true },
        products: [
          {
            _id: "p3",
            name: "Headphones",
            description: "Noise-cancelling over-ear headphones",
            price: 250,
          },
        ],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("N/A")).toBeInTheDocument();
      expect(screen.getByText("Headphones")).toBeInTheDocument();
      expect(screen.getByText("Price : 250")).toBeInTheDocument();
    });
  });

  it("renders order details correctly with success payment", async () => {
    // Arrange
    const mockOrders = [
      {
        _id: "o1",
        status: "Processing",
        buyer: { name: "Safwan Hussein" },
        createdAt: new Date(),
        payment: { success: true },
        products: [
          {
            _id: "p1",
            name: "Smartphone",
            description: "A flagship phone with OLED display",
            price: 1200,
          },
        ],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    // Act
    render(React.createElement(Orders));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Safwan Hussein")).toBeInTheDocument();
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(screen.getByText("Price : 1200")).toBeInTheDocument();
    });
  });

  it("renders 'Pending' when payment is not successful", async () => {
    // Arrange
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({
      data: {
        orders: [
          {
            _id: "order2",
            status: "Pending",
            buyer: { name: "Safwan Hussein" },
            createdAt: new Date(),
            payment: { success: false },
            products: [
              { _id: "p2", name: "Keyboard", description: "Mechanical", price: 200 },
            ],
          },
        ],
      },
    });

    // Act
    render(React.createElement(Orders));

    // Assert
    const pendingCells = await screen.findAllByText("Pending");
    expect(pendingCells.length).toBeGreaterThan(0);
  });

  


});


