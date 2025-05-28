import React, { useState } from "react";
import CommonSelection from "../../components/UI/CommonSelection";
import Helmet from "../../components/Helmet/Helmet";
import { Col, Container, Row } from "reactstrap";
import "./Shop.css";

import products from "../../assets/data/products";
import ProductList from "../../components/UI/ProductList";

const Shop = () => {
  const [productsData, setProductsData] = useState(products);
  productsData.sort((a, b) => a.price - b.price);
  const [productSort, setProductSort] = useState([]);
  const handleFilter = (e) => {
    const filterValue = e.target.value;
    const filterProducts = products?.filter(
      (item) => item.category === filterValue.toString()
    );

    setProductsData(filterProducts.length ? filterProducts : products);
  };

  const handleSort = (e) => {
    const keyOption = e.target.value;
    console.log(keyOption);
    keyOption === "money"
      ? setProductSort(productsData.sort((a, b) => a.price - b.price))
      : setProductSort(productsData.sort((a, b) => b.price - a.price));
  };

  const handleSearch = (e) => {
    const searchItem = e.target.value;

    const searchProducts = products.filter((item) =>
      item.productName.toLowerCase().includes(searchItem.toLowerCase())
    );

    setProductsData(searchProducts);
  };

  return (
    <Helmet title={"Shop"}>
      {/* <CommonSelection title="Products" /> */}

      <section className="">
        <Container>
          <Row>
            <Col lg="3" md="3">
              <div className="filter_widget">
                <select onChange={handleFilter}>
                  <option>Tất cả </option>
                  <option value="sofa">Ghế Dài</option>
                  <option value="chair">Ghế Nhỏ</option>
                  <option value="mobile">Điện thoại</option>
                  <option value="watch">Đồng Hồ</option>
                  <option value="wireless">Tai nghe</option>
                </select>
              </div>
            </Col>
            <Col lg="3" md="3">
              <div className="filter_widget">
                <select name="" id="" onChange={handleSort}>
                  <option>Sắp xếp</option>
                  <option value="trending">Xu hướng</option>
                  <option value="money">Gía tiền</option>
                </select>
              </div>
            </Col>
            <Col lg="6" md="6">
              <div className="search_box">
                <input
                  type="text"
                  placeholder="Tiềm kiếm..."
                  onChange={handleSearch}
                />
                <span>
                  <i className="ri-search-line"></i>
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="pt-0">
        <Container>
          <Row>
            {productsData.length === 0 ? (
              <h1 className="text-center">
                Xin lỗi bạn, Shop Hường Mỵ chưa có sản phẩm này
              </h1>
            ) : (
              <ProductList
                data={productSort.length ? productSort : productsData}
              />
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Shop;
