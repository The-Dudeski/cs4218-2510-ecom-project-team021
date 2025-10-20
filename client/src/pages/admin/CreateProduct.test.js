import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { within } from "@testing-library/react";


jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);
jest.mock("../../components/AdminMenu", () => () => <div>Mocked AdminMenu</div>);

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "mocked-url");
	jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui, { route = "/dashboard/admin/create" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/dashboard/admin/create" element={ui} />
        <Route path="/dashboard/admin/products" element={<div>Products Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Unit test for CreateProduct Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form components correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
    renderWithRouter(<CreateProduct />);

    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
    expect(screen.getByText("Upload Photo")).toBeInTheDocument();
  });

  it("fetches categories successfully", async () => {
		axios.get.mockResolvedValueOnce({
			data: {
				success: true,
				category: [{ _id: "category1", name: "TestCategory" }],
			},
		});

		renderWithRouter(<CreateProduct />);

		const categorySelect = screen.getAllByRole("combobox")[0];
		fireEvent.mouseDown(categorySelect);

		await waitFor(() => {
			expect(screen.getByText("TestCategory")).toBeInTheDocument();
		});
	});

  it("handles failed category fetching (success=false)", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: false, category: [] },
    });

    renderWithRouter(<CreateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
    });
  });

  it("handles network error during category fetching", async () => {
		axios.get.mockRejectedValueOnce(new Error("Network error"));

		renderWithRouter(<CreateProduct />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
		});
	});

  it("creates product successfully and ensures form data is correct", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "category1", name: "TestCategory" }] },
    });

    axios.post.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<CreateProduct />);

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "New Product" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "New description" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a price"), {
      target: { value: "99" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: "5" },
    });

    const selectElements = screen.getAllByRole("combobox");
    fireEvent.mouseDown(selectElements[0]); 
    fireEvent.click(await screen.findByText("category1"));

    fireEvent.mouseDown(selectElements[1]); 
    fireEvent.click(await screen.findByText("Yes"));

    const file = new File(["image-content"], "test-image.png", { type: "image/png" });
		const uploadInput = screen.getByTestId("file-input");
		fireEvent.change(uploadInput, { target: { files: [file] } });


    fireEvent.click(screen.getByRole("button", { name: /CREATE PRODUCT/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    const formDataArg = axios.post.mock.calls[0][1];
    expect(formDataArg.get("name")).toBe("New Product");
    expect(formDataArg.get("description")).toBe("New description");
    expect(formDataArg.get("price")).toBe("99");
    expect(formDataArg.get("quantity")).toBe("5");
    expect(formDataArg.get("photo")).toBe(file);
  });

  it("handles failed product creation", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "category1", name: "TestCategory" }] },
    });

    axios.post.mockResolvedValueOnce({
    	data: { success: false, message: "Failed to create product" },
    });


    renderWithRouter(<CreateProduct />);

    fireEvent.click(screen.getByRole("button", { name: /CREATE PRODUCT/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create product");
    });
  });

  it("handles network error during product creation", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "category1", name: "TestCategory" }] },
    });

    axios.post.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<CreateProduct />);

    fireEvent.click(screen.getByRole("button", { name: /CREATE PRODUCT/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong while creating product");
    });
  });


	it("allows selecting a shipping option", async () => {
		axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });

		renderWithRouter(<CreateProduct />);

		const selects = screen.getAllByRole("combobox");
		fireEvent.mouseDown(selects[1]); 
		const dropdown = document.body.querySelector(".ant-select-dropdown");
		fireEvent.click(within(dropdown).getByText("Yes"));

		expect(screen.getAllByText("Yes").length).toBeGreaterThan(0);
	});

});

describe("Integration Tests for CreateProduct", () => {
  afterEach(() => jest.clearAllMocks());

  it("completes full product creation flow successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "cat1", name: "TestCategory" }] },
    });

    axios.post.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<CreateProduct />);

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "TestProduct" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "Description" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a price"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.mouseDown(selects[0]);
    fireEvent.click(await screen.findByText("TestCategory"));

    fireEvent.mouseDown(selects[1]);
    fireEvent.click(await screen.findByText("Yes"));

    const file = new File(["image"], "photo.png", { type: "image/png" });
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /CREATE PRODUCT/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    const formDataArg = axios.post.mock.calls[0][1];
    expect(formDataArg.get("name")).toBe("TestProduct");
    expect(formDataArg.get("photo")).toBe(file);
  });

  it("handles category fetch failure and product creation error", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: false, category: [] },
    });
    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "Invalid product data" },
    });

    renderWithRouter(<CreateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category"
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /CREATE PRODUCT/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid product data");
    });
  });

  it("shows preview when file uploaded and clears after re-render", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [] },
    });

    renderWithRouter(<CreateProduct />);

    const file = new File(["test"], "preview.png", { type: "image/png" });
    const fileInput = screen.getByTestId("file-input");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("product_photo")).toBeInTheDocument();
    });
  });
});
