import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";
import { MemoryRouter, Route, Routes } from "react-router-dom";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
  if (!global.URL.createObjectURL) {
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  }
});

afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
  if (global.URL.createObjectURL && global.URL.createObjectURL.mock) {
    delete global.URL.createObjectURL;
  }
});

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);
jest.mock("../../components/AdminMenu", () => () => <div>Mocked AdminMenu</div>);

const renderWithRouter = (ui, { route = "/dashboard/admin/update/slug123" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/dashboard/admin/update/:slug" element={ui} />
        <Route path="/dashboard/admin/products" element={<div>Products Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

const waitForProductToLoad = async (expectedNameValue) => {
  const nameInput = await screen.findByPlaceholderText("write a name");
  await waitFor(() => expect(nameInput).toHaveValue(expectedNameValue));
};

let originalPrompt;
beforeAll(() => {
  originalPrompt = window.prompt;
});
afterAll(() => {
  window.prompt = originalPrompt;
});

describe("UpdateProduct Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches single product successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: {
          _id: "1",
          name: "Test Product",
          description: "Cool product",
          price: 100,
          quantity: 5,
          shipping: 1,
          category: { _id: "category1" }
        }
      }
    });

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "category1", name: "TestCategory" }] }
    });

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
      expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    });
  });

  it("handles failed single product fetching", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: false, message: "Product not found" } });

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in fetching product");
    });
  });

  it("handles network errors during single product fetching", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in fetching product");
    });
  });

  it("fetches categories successfully", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({
        data: { success: true, category: [{ _id: "category1", name: "TestCategory" }] }
      });

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(screen.getByText("TestCategory")).toBeInTheDocument();
    });
  });

  it("handles failed categories fetching", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
    });
  });

  it("handles network errors during categories fetching", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
    });
  });

  it("Shows success message when product updates successfully", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Old Product",
            description: "Old description",
            price: 50,
            quantity: 10,
            shipping: 1,
            category: { _id: "category1"}
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Old Product");

    const updateButton = await screen.findByTestId("update-product-btn");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
      expect(screen.getByText("Products Page")).toBeInTheDocument();
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/1",
        expect.any(FormData)
      );
    });
  });

  it("updates product with new input values", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Old Product",
            description: "Old description",
            price: 50,
            quantity: 10,
            shipping: 1,
            category: { _id: "category1" },
          },
        },
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Old Product");

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
      target: { value: "25" },
    });

    const updateButton = await screen.findByTestId("update-product-btn");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");

      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/1",
        expect.any(FormData)
      );

      const formDataArg = axios.put.mock.calls[0][1];
      expect(formDataArg.get("name")).toBe("New Product");
      expect(formDataArg.get("description")).toBe("New description");
      expect(formDataArg.get("price")).toBe("99");
      expect(formDataArg.get("quantity")).toBe("25");
      expect(formDataArg.get("category")).toBe("category1");
    });
  });

  it("handles network error when network error occurs during update", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Old Product",
            description: "Old desc",
            price: 50,
            quantity: 10,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.put.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Old Product");

    const updateButton = await screen.findByTestId("update-product-btn");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("handles failed updates", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Old Product",
            description: "Old desc",
            price: 50,
            quantity: 10,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.put.mockResolvedValueOnce({ data: { success: false, message: "Update failed" } });

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Old Product");

    const updateButton = await screen.findByTestId("update-product-btn");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
  });

  it("shows the default product image when no new photo is selected", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Prod",
            description: "Desc",
            price: 10,
            quantity: 2,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Prod");

    const img = await screen.findByAltText("product_photo");
    expect(img).toHaveAttribute("src", "/api/v1/product/product-photo/1");
  });

  it("switches to preview when selecting a new photo", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Prod",
            description: "Desc",
            price: 10,
            quantity: 2,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { container } = renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Prod");

    const fileInput = container.querySelector('input[type="file"][name="photo"]');
    const file = new File([new Uint8Array([1, 2, 3])], "photo.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const img = await screen.findByAltText("product_photo");
    expect(img).toHaveAttribute("src", "blob:mock-url");

    fireEvent.click(await screen.findByTestId("update-product-btn"));

    await waitFor(() => {
      const fd = axios.put.mock.calls[0][1];
      expect(fd.get("photo")).toBe(file);
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    });
  });

  it("does not append photo when none selected", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Old",
            description: "Old",
            price: 10,
            quantity: 2,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<UpdateProduct />);

    const nameInput = await screen.findByPlaceholderText("write a name");
    await waitFor(() => expect(nameInput).toHaveValue("Old"));

    fireEvent.click(await screen.findByTestId("update-product-btn"));

    await waitFor(() => {
      const fd = axios.put.mock.calls[0][1];
      expect(fd.get("photo")).toBeNull();
    });
  });

  it("deletes product successfully and navigates", async () => {
    window.prompt = jest.fn().mockReturnValue(true);

    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1", 
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Test Product");

    const deleteButton = await screen.findByText(/DELETE PRODUCT/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/v1/product/delete-product/1");
      expect(toast.success).toHaveBeenCalledWith("Product Deleted Successfully");
      expect(screen.getByText("Products Page")).toBeInTheDocument();
    });
  });

  it("handles failed delete", async () => {
    window.prompt = jest.fn().mockReturnValue(true);

    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.delete.mockResolvedValueOnce({ data: { success: false, message: "Delete failed" } });

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Test Product");

    const deleteButton = await screen.findByText(/DELETE PRODUCT/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Delete failed");
    });
  });

  it("handles network errors that occur during delete", async () => {
    window.prompt = jest.fn().mockReturnValue(true);

    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });

    axios.delete.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Test Product");

    const deleteButton = await screen.findByText(/DELETE PRODUCT/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("does not set categories when API returns success false", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Test Product",
            description: "Cool product",
            price: 100,
            quantity: 5,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({ data: { success: false, category: [] } });

    renderWithRouter(<UpdateProduct />);

    await waitFor(() => {
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });
  });

  it("updates category via Select and sends selected category id", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          product: {
            _id: "1",
            name: "Old Product",
            description: "Old description",
            price: 50,
            quantity: 10,
            shipping: 1,
            category: { _id: "category1" }
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "category1", name: "Cat 1" },
            { _id: "category2", name: "Cat 2" }
          ]
        }
      });

    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { container } = renderWithRouter(<UpdateProduct />);

    await waitForProductToLoad("Old Product");

    const allSelects = container.querySelectorAll(".ant-select");
    const categorySelect = allSelects[0];
    const selector = categorySelect.querySelector(".ant-select-selector");
    fireEvent.mouseDown(selector);

    const option = await screen.findByText("Cat 2");
    fireEvent.click(option);

    fireEvent.click(await screen.findByTestId("update-product-btn"));

    await waitFor(() => {
      const fd = axios.put.mock.calls[0][1];
      expect(fd.get("category")).toBe("category2");
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    });
  });
});
