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

    render(React.createElement(Orders));

    const pendingCells = await screen.findAllByText("Pending");
    expect(pendingCells.length).toBeGreaterThan(0);
  });
});

describe("Integration Tests — Orders Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and displays orders when token exists", async () => {
    const mockOrders = [
      {
        _id: "o1",
        status: "Delivered",
        buyer: { name: "Safwan Hussein" },
        createdAt: new Date().toISOString(),
        payment: { success: true },
        products: [
          { _id: "p1", name: "Laptop", description: "Gaming laptop", price: 1500 },
        ],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    expect(await screen.findByText(/All Orders/i)).toBeInTheDocument();
    expect(await screen.findByText(/Delivered/i)).toBeInTheDocument();
    expect(screen.getByText(/Safwan Hussein/i)).toBeInTheDocument();
    expect(screen.getByText(/Success/i)).toBeInTheDocument();
    expect(screen.getByText(/^Laptop$/i)).toBeInTheDocument(); 
  });
  
  it("renders 'Pending' for failed payments", async () => {
    const mockOrders = [
      {
        _id: "o2",
        status: "Processing",
        buyer: { name: "Chris Lee" },
        createdAt: new Date().toISOString(),
        payment: { success: false },
        products: [{ _id: "p2", name: "Mouse", description: "Wireless", price: 50 }],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    render(<Orders />);

    expect(await screen.findByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Mouse")).toBeInTheDocument();
    expect(screen.getByText("Price : 50")).toBeInTheDocument();
  });

  it("renders 'N/A' if createdAt is missing", async () => {
    const mockOrders = [
      {
        _id: "o3",
        status: "Processing",
        buyer: { name: "Safwan Hussein" },
        createdAt: null,
        payment: { success: true },
        products: [{ _id: "p3", name: "Headphones", description: "Noise-cancelling", price: 250 }],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    render(<Orders />);

    expect(await screen.findByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("Headphones")).toBeInTheDocument();
  });

  it("handles missing description safely", async () => {
    const mockOrders = [
      {
        _id: "o4",
        status: "Delivered",
        buyer: { name: "Alex" },
        createdAt: new Date().toISOString(),
        payment: { success: true },
        products: [
          { _id: "p4", name: "Monitor", description: null, price: 300 },
        ],
      },
    ];

    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: mockOrders } });

    render(<Orders />);

    expect(await screen.findByText("Monitor")).toBeInTheDocument();
    expect(screen.getByText("Price : 300")).toBeInTheDocument();
  });

  it("handles API error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    render(<Orders />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching orders", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
  
  it("renders empty state when API returns no orders", async () => {
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { orders: [] } });

    const { container } = render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    const rows = container.querySelectorAll("table tbody tr");
    expect(rows.length).toBe(0);
  });
});


