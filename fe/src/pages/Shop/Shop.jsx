import React, { useState, useEffect } from "react";
import { Container, Row, Col, FormGroup, Input, Spinner } from "reactstrap";
import { motion, AnimatePresence } from "framer-motion";
import Helmet from "../../components/Helmet/Helmet";
import CommonSelection from "../../components/UI/CommonSelection";
import ProductList from "../../components/UI/ProductList";
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "./Shop.css";

const Shop = () => {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://smashing-valid-jawfish.ngrok-free.app/api/product-service/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        console.log("response::", response);
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProductsData(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleFilter = (e) => {
    const filterValue = e.target.value;
    setFilter(filterValue);
  };

  const handleSort = (e) => {
    const sortValue = e.target.value;
    setSort(sortValue);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Lọc và sắp xếp dữ liệu
  let filteredProducts = [...productsData];
  if (filter !== "all") {
    filteredProducts = filteredProducts.filter((item) => item.category === filter);
  }
  if (search) {
    filteredProducts = filteredProducts.filter((item) =>
      item.productName.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (sort === "money") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "money-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
        </motion.div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <h4 className="text-danger">Lỗi: {error}</h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </motion.button>
      </Container>
    );
  }

  return (
    <Helmet title="Shop">
      <section>
        <Container>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Row>
              <Col lg="3" md="6">
                <FormGroup className="filter_widget">
                  <motion.select
                    onChange={handleFilter}
                    className="form-select"
                    whileHover={{ scale: 1.02 }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="sofa">Ghế Dài</option>
                    <option value="chair">Ghế Nhỏ</option>
                    <option value="mobile">Điện thoại</option>
                    <option value="watch">Đồng Hồ</option>
                    <option value="wireless">Tai nghe</option>
                  </motion.select>
                </FormGroup>
              </Col>
              <Col lg="3" md="6">
                <FormGroup className="filter_widget">
                  <motion.select
                    onChange={handleSort}
                    className="form-select"
                    whileHover={{ scale: 1.02 }}
                  >
                    <option value="default">Sắp xếp</option>
                    <option value="money">Giá: Thấp đến Cao</option>
                    <option value="money-desc">Giá: Cao đến Thấp</option>
                  </motion.select>
                </FormGroup>
              </Col>
              <Col lg="6" md="12">
                <div className="search_box position-relative" style={{outline: "none"}}>
                  <motion.input
                    type="text"
                    placeholder="Tìm kiếm..."
                    onChange={handleSearch}
                    className="form-control"
                  />
                  <span className="search_icon">
                    <i className="ri-search-line"></i>
                  </span>
                </div>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

        <Container>
          <Row>
          <h2 className="mb-3 text-primary fw-bold">Danh sách sản phẩm</h2>
            <AnimatePresence>
              {filteredProducts.length === 0 ? (
                <motion.h1
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Xin lỗi, Shop Hường Mỵ chưa có sản phẩm này
                </motion.h1>
              ) : (
                <ProductList data={filteredProducts} />
              )}
            </AnimatePresence>
          </Row>
        </Container>
    </Helmet>
  );
};

export default Shop;