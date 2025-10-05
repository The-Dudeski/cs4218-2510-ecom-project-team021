import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/HomepageStyles.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) setCategories(data.category);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // get total product count
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      if (typeof data?.total === "number" && data.total >= 0) {
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching total:", error);
    }
  };

  // get products for a page
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      if (Array.isArray(data?.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      setLoading(false);
    }
  };

  // load more products (pagination)
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      if (Array.isArray(data?.products)) {
        setProducts((prev) => [...prev, ...data.products]);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoading(false);
    }
  };

  // category filter toggle
  const handleFilter = (value, id) => {
    setChecked((prev) => (value ? [...prev, id] : prev.filter((c) => c !== id)));
  };

  // get filtered products
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      if (Array.isArray(data?.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error filtering products:", error);
    }
  };

  // initial fetch (fixed to prevent act() warnings)
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [catRes, totalRes, prodRes] = await Promise.all([
          axios.get("/api/v1/category/get-category"),
          axios.get("/api/v1/product/product-count"),
          axios.get(`/api/v1/product/product-list/${page}`),
        ]);

        if (!isMounted) return;

        if (catRes?.data?.success) setCategories(catRes.data.category);
        if (typeof totalRes?.data?.total === "number")
          setTotal(totalRes.data.total);
        if (Array.isArray(prodRes?.data?.products))
          setProducts(prodRes.data.products);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [page]);

  // page increment (pagination)
  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  // refetch all products when filters cleared
  useEffect(() => {
    if (!checked.length && !radio.length) {
      getAllProducts();
    }
  }, [checked.length, radio.length]);

  // filter products when filters applied
  useEffect(() => {
    if (checked.length || radio.length) {
      filterProduct();
    }
  }, [checked, radio]);

  // reset filters
  const resetFilters = () => {
    setChecked([]);
    setRadio([]);
    setPage(1);
    getAllProducts();
  };

  return (
    <Layout title={"ALL Products - Best offers"}>
      {/* banner image */}
      <img
        src="/images/Virtual.png"
        className="banner-img"
        alt="bannerimage"
        width={"100%"}
      />

      <div className="container-fluid row mt-3 home-page">
        {/* filters */}
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories.length > 0 ? (
              categories.map((c) => (
                <Checkbox
                  key={c._id}
                  checked={checked.includes(c._id)}
                  onChange={(e) => handleFilter(e.target.checked, c._id)}
                >
                  {c.name}
                </Checkbox>
              ))
            ) : (
              <p>No categories available</p>
            )}
          </div>

          {/* price filter */}
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {Prices.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>

          <div className="d-flex flex-column">
            <button className="btn btn-danger" onClick={resetFilters}>
              RESET FILTERS
            </button>
          </div>
        </div>

        {/* product section */}
        <div className="col-md-9">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products.map((p) => (
              <div className="card m-2" key={p._id}>
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <div className="card-name-price">
                    <h5 className="card-title">{p.name}</h5>
                    <h5 className="card-title card-price">
                      {p.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </h5>
                  </div>
                  <p className="card-text ">
                    {p.description.substring(0, 60)}...
                  </p>
                  <div className="card-name-price">
                    <button
                      className="btn btn-info ms-1"
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      More Details
                    </button>
                    <button
                      className="btn btn-dark ms-1"
                      onClick={() => {
                        setCart((prev) => {
                          const updated = [...prev, p];
                          localStorage.setItem(
                            "cart",
                            JSON.stringify(updated)
                          );
                          return updated;
                        });
                        toast.success("Item Added to cart");
                      }}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* load more */}
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn loadmore"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((prev) => prev + 1);
                }}
              >
                {loading ? "Loading ..." : <>Loadmore <AiOutlineReload /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
