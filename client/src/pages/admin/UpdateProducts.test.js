import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";
import { MemoryRouter, Route, Routes } from "react-router-dom";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
	jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
	console.log.mockRestore();
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

		const updateButton = await screen.findByTestId("update-product-btn");
		fireEvent.click(updateButton);


    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
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

		fireEvent.change(await screen.findByPlaceholderText("write a name"), {
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

		const updateButton = await screen.findByTestId("update-product-btn");
		fireEvent.click(updateButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Update failed");
		});
	});


  it("deletes product successfully", async () => {
    window.prompt = jest.fn().mockReturnValue(true);

    axios.get
      .mockResolvedValueOnce({
        data: {
					product: {
						id: "1",
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

    const deleteButton = await screen.findByText(/DELETE PRODUCT/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Deleted Successfully");
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

});
