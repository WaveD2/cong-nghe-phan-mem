import React from "react";
import { Container, Row, Col } from "reactstrap";
import useGetDataFireBase from "../custom-hook/useGetDataFireBase";
import "./styles.css";
const Dashboard = () => {
  const { data: products } = useGetDataFireBase("products");
  const { data: users } = useGetDataFireBase("users");

  return (
    <section style={{ minHeight: "50vh" }}>
      <Container>
        <Row>
          <Col lg="3">
            <div className="revenue_box">
              <h5>Sản phẩm Seal</h5>
              <span>123</span>
            </div>
          </Col>
          <Col lg="3">
            <div className="order_box">
              <h5>Số lượng sản phẩm đã bán</h5>
              <span>123</span>
            </div>
          </Col>
          <Col lg="3">
            <div className="product_box">
              <h5>Số lượng sản phẩm</h5>
              <span>{products.length || 0} </span>
            </div>
          </Col>
          <Col lg="3">
            <div className="user_box">
              <h5>Số lượng người dùng</h5>
              <span>{users.length}</span>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Dashboard;
