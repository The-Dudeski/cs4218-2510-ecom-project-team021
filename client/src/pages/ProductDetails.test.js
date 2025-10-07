import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import ProductDetails from "./ProductDetails";

jest.mock("axios");

jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe("ProductDetails Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays correct product details", async () => {
    const product = {
      _id: "p1",
      name: "Gaming Laptop",
      description: "Powerful laptop for gaming",
      price: 1500,
      category: { _id: "c1", name: "Electronics" },
    };

    axios.get.mockResolvedValueOnce({ data: { product } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    render(
      <MemoryRouter initialEntries={["/product/gaming-laptop"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Name : Gaming Laptop")).toBeInTheDocument();
      expect(
        screen.getByText("Description : Powerful laptop for gaming")
      ).toBeInTheDocument();
      expect(screen.getByText("Category : Electronics")).toBeInTheDocument();
    });
  });

  it("formats price correctly", async () => {
    const product = {
      _id: "p1",
      name: "Gaming Laptop",
      description: "Laptop",
      price: 1500,
      category: { _id: "c1", name: "Electronics" },
    };

    axios.get.mockResolvedValueOnce({ data: { product } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    render(
      <MemoryRouter initialEntries={["/product/gaming-laptop"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\$1,500\.00/)).toBeInTheDocument();
    });
  });

  it("displays related products correctly", async () => {
    const product = {
      _id: "p1",
      name: "Gaming Laptop",
      description: "Laptop",
      price: 1500,
      category: { _id: "c1", name: "Electronics" },
    };
    const related = [
      {
        _id: "r1",
        name: "Mouse",
        description: "Wireless mouse",
        price: 50,
        slug: "mouse",
      },
    ];

    axios.get
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { products: related } });

    render(
      <MemoryRouter initialEntries={["/product/gaming-laptop"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mouse")).toBeInTheDocument();
      expect(screen.getByText(/Wireless mouse/)).toBeInTheDocument();
      expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
    });
  });

  it("shows 'No Similar Products found' if related products list is empty", async () => {
    const product = {
      _id: "p1",
      name: "Gaming Laptop",
      description: "Laptop",
      price: 1500,
      category: { _id: "c1", name: "Electronics" },
    };

    axios.get
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { products: [] } });

    render(
      <MemoryRouter initialEntries={["/product/gaming-laptop"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No Similar Products found/i)
      ).toBeInTheDocument();
    });
  });

  it("navigates to related product details when 'More Details' button is clicked", async () => {
    const product = {
      _id: "p1",
      name: "Gaming Laptop",
      description: "Laptop",
      price: 1500,
      category: { _id: "c1", name: "Electronics" },
    };
    const related = [
      {
        _id: "r1",
        name: "Mouse",
        description: "Wireless mouse",
        price: 50,
        slug: "mouse",
      },
    ];

    axios.get
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { products: related } });

    render(
      <MemoryRouter initialEntries={["/product/gaming-laptop"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/product/mouse" element={<div>Mouse Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: /More Details/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Mouse Page")).toBeInTheDocument();
    });
  });

  it("renders all related products", async () => {
    const product = {
      _id: "p1",
      name: "Gaming Laptop",
      description: "Laptop",
      price: 1500,
      category: { _id: "c1", name: "Electronics" },
    };
    const related = [
      { _id: "r1", name: "Mouse", description: "Wireless", price: 50, slug: "mouse" },
      { _id: "r2", name: "Keyboard", description: "Mechanical", price: 100, slug: "keyboard" },
      { _id: "r3", name: "Monitor", description: "HD Display", price: 200, slug: "monitor" },
    ];

    axios.get
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { products: related } });

    render(
      <MemoryRouter initialEntries={["/product/gaming-laptop"]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mouse")).toBeInTheDocument();
      expect(screen.getByText("Keyboard")).toBeInTheDocument();
      expect(screen.getByText("Monitor")).toBeInTheDocument();
    });
  });

  it("handles missing product fields without crashing", async () => {
	const incompleteProduct = { _id: "p1" };
	axios.get
		.mockResolvedValueOnce({ data: { product: incompleteProduct } })
		.mockResolvedValueOnce({ data: { products: [] } });

	render(
		<MemoryRouter initialEntries={["/product/unknown"]}>
		<Routes>
			<Route path="/product/:slug" element={<ProductDetails />} />
		</Routes>
		</MemoryRouter>
	);

	await waitFor(() => {
		expect(screen.getByText(/Product Details/i)).toBeInTheDocument();
	});

	expect(
		screen.getByRole("button", { name: /ADD TO CART/i })
	).toBeInTheDocument();
	});

	it("handles API error gracefully", async () => {
	axios.get.mockRejectedValueOnce(new Error("Network error"));

	render(
		<MemoryRouter initialEntries={["/product/broken"]}>
		<Routes>
			<Route path="/product/:slug" element={<ProductDetails />} />
		</Routes>
		</MemoryRouter>
	);

	await waitFor(() => {
		expect(screen.getByText(/Product Details/i)).toBeInTheDocument();
	});
	});


	it("does not fetch product if slug is missing", async () => {
		render(
			<MemoryRouter initialEntries={["/product/"]}>
				<Routes>
					<Route path="/product/:slug?" element={<ProductDetails />} />
				</Routes>
			</MemoryRouter>
		);

		expect(axios.get).not.toHaveBeenCalled();
	});




});
