import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import AdminMenu from "./../../components/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import CategoryForm from "../../components/Form/CategoryForm";
import { Modal } from "antd";
const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  //handle Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || name.trim() === "") {
      toast.error("Category name is required");
      return;
    }
    try {
      const response = await axios.post("/api/v1/category/create-category", { name });
      const data = response?.data;
      if (data?.success) {
        toast.success(`${name} is created`);
        getAllCategory();
        setName("");
      } else {
        if (data?.message?.toLowerCase().includes("exists")) {
          toast.error("Category already exists");
        } else {
          toast.error(data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.log("CreateCategory;handleSubmit error:", error.message);
      toast.error("Something went wrong in input form");
    }
  };

  //get all cat
  const getAllCategory = async () => {
    try {
      const response = await axios.get("/api/v1/category/get-category");
      const data = response?.data;
      if (data?.success) {
        setCategories(data.category);
      }
    } catch (error) {
      console.log("CreateCategory;getAllCategory error:", error.message);
      toast.error("Something went wrong in getting category");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  //update category
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (updatedName.trim() === selected.name.trim()) {
      setVisible(false);
      toast.dismiss(); // clear any active toast just in case
      return;
    }

    if (!updatedName || updatedName.trim() === "") {
      toast.error("Category name is required");
      return;
    }
    try {
      const response = await axios.put(
        `/api/v1/category/update-category/${selected._id}`,
        { name: updatedName }
      );
      const data = response?.data;
      if (data?.success) {
        toast.success(`${updatedName} is updated`);
        setSelected(null);
        setUpdatedName("");
        setVisible(false);
        getAllCategory();
      } else {
        if (data?.message?.toLowerCase().includes("exists")) {
          toast.error("Category already exists");
        } else {
          toast.error(data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.log("CreateCategory handleUpdate error:", error.message);
      if (error.response?.status === 409) {
        toast.error("Category already exists");
      } else {
        toast.error("Something went wrong while updating category");
      }
    }
  };
  //delete category
  const handleDelete = async (pId) => {
    try {
      const response = await axios.delete(`/api/v1/category/delete-category/${pId}`);
      const data = response?.data;
      if (data?.success) {
        toast.success(`category is deleted`);

        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  return (
    <Layout title={"Dashboard - Create Category"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Manage Category</h1>
            <div className="p-3 w-50">
              <CategoryForm
                handleSubmit={handleSubmit}
                value={name}
                setValue={setName}
                testId="create-category-input"
              />
            </div>
            <div className="w-75">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((c) => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>
                          <button
                            className="btn btn-primary ms-2"
                            onClick={() => {
                              setVisible(true);
                              setUpdatedName(c.name);
                              setSelected(c);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            data-testid={`delete-btn-${c._id}`}
                            className="btn btn-danger ms-2"
                            onClick={() => handleDelete(c._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              onCancel={() => setVisible(false)}
              footer={null}
              open={visible}
            >
              <CategoryForm
                value={updatedName}
                setValue={setUpdatedName}
                handleSubmit={handleUpdate}
                testId="update-category-input"
              />
            </Modal>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCategory;