import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";

jest.mock("axios");
jest.mock("react-hot-toast");

// mock layout & admin menu
jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu">Mocked AdminMenu</div>
));

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

describe("CreateCategory Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new category with valid input", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Books" }] },
    });

    render(<CreateCategory />);

    const input = screen.getByTestId("create-category-input");
    fireEvent.change(input, { target: { value: "Books" } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Books is created");
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  it("shows error toast when create returns success false", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: false, message: "Invalid" } });

    render(<CreateCategory />);

    const input = screen.getByTestId("create-category-input");
    fireEvent.change(input, { target: { value: "Books" } });

    fireEvent.click(screen.getByTestId("create-submit"));

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid");
    });
    });

  it("handles network error during category creation", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<CreateCategory />);

    const input = screen.getByTestId("create-category-input");
    fireEvent.change(input, { target: { value: "Failed" } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in input form"
      );
    });
  });

  it("does not call API when input name is empty", async () => {
    render(<CreateCategory />);

    const input = screen.getByTestId("create-category-input");
    fireEvent.change(input, { target: { value: "" } });

    fireEvent.click(screen.getByText(/Submit/i));

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("fetches categories successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Books" }] },
    });

    render(<CreateCategory />);

    await waitFor(() => {
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  it("handles network errors for fetching", async () => {
    axios.get.mockRejectedValueOnce(new Error("API error"));

    render(<CreateCategory />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category"
      );
    });
  });

  it("updates category successfully", async () => {
    const category = { _id: "1", name: "Old" };

    axios.get.mockResolvedValueOnce({ data: { success: true, category: [category] } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "Updated" }] } });

    render(<CreateCategory />);

    fireEvent.click(await screen.findByText(/Edit/i));

    const input = screen.getByTestId("update-category-input");
    fireEvent.change(input, { target: { value: "Updated" } });

    fireEvent.click(screen.getByTestId("update-submit"));


    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Updated is updated");
      expect(screen.getByText("Updated")).toBeInTheDocument();
    });
  });

  it("shows error toast when update returns success false", async () => {
    const category = { _id: "1", name: "Old" };
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [category] } });
    axios.put.mockResolvedValueOnce({ data: { success: false, message: "Update failed" } });

    render(<CreateCategory />);

    fireEvent.click(await screen.findByText(/Edit/i));

    const input = screen.getByTestId("update-category-input");
    fireEvent.change(input, { target: { value: "Updated" } });

    fireEvent.click(screen.getByTestId("update-submit"));

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
	});


  it("handles network error during category update", async () => {
    const category = { _id: "1", name: "Old" };

    axios.get.mockResolvedValueOnce({ data: { success: true, category: [category] } });
    axios.put.mockRejectedValueOnce(new Error("Update error"));

    render(<CreateCategory />);

    fireEvent.click(await screen.findByText(/Edit/i));

    const input = screen.getByTestId("update-category-input");
    fireEvent.change(input, { target: { value: "FailUpdate" } });

    fireEvent.click(screen.getByTestId("update-submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("deletes category successfully", async () => {
    const category = { _id: "1", name: "ToDelete" };

    axios.get.mockResolvedValueOnce({ data: { success: true, category: [category] } });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });

    render(<CreateCategory />);

    const deleteButton = await screen.findByTestId("delete-btn-1");
    fireEvent.click(deleteButton);


    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
    });
  });

	it("shows error toast when delete returns success false", async () => {
		const category = { _id: "1", name: "ToDelete" };
		axios.get.mockResolvedValueOnce({ data: { success: true, category: [category] } });
		axios.delete.mockResolvedValueOnce({ data: { success: false, message: "Delete failed" } });

		render(<CreateCategory />);

		const deleteButton = await screen.findByTestId("delete-btn-1");
		fireEvent.click(deleteButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Delete failed");
		});
	});


  it("handles network error during category deletion", async () => {
    const category = { _id: "1", name: "ToDelete" };

    axios.get.mockResolvedValueOnce({ data: { success: true, category: [category] } });
    axios.delete.mockRejectedValueOnce(new Error("Delete error"));

    render(<CreateCategory />);

    const deleteButton = await screen.findByTestId("delete-btn-1");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("updates only the selected category while keeping others intact", async () => {
    const categories = [
      { _id: "1", name: "Books" },
      { _id: "2", name: "Shirts" },
    ];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });

    render(<CreateCategory />);
    await waitFor(() => {
      expect(screen.getByText("Books")).toBeInTheDocument();
      expect(screen.getByText("Shirts")).toBeInTheDocument();
    });

    axios.put.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [
          { _id: "1", name: "Updated" },
          { _id: "2", name: "Shirts" },
        ],
      },
    });

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const input = screen.getByTestId("update-category-input");
    fireEvent.change(input, { target: { value: "Updated" } });

    const updateButton = screen.getByTestId("update-submit");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Updated is updated");
      expect(screen.getByText("Updated")).toBeInTheDocument();
      expect(screen.getByText("Shirts")).toBeInTheDocument();
    });
  });
});
