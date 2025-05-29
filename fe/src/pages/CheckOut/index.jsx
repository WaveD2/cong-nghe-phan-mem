import React, { useRef } from "react";
import "./CheckOut.css";
import { Container, Row, Col, Form, FormGroup } from "reactstrap";
import Helmet from "../../components/Helmet/Helmet";
import CommonSection from "../../components/UI/CommonSelection";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const Checkout = () => {
  const closeRef = useRef();
  const totoQty = useSelector((state) => state.cart.totalQuantity);
  const totoAmount = useSelector((state) => state.cart.totalAmount);
  const handleClose = () => {
    console.log(closeRef.current);
    closeRef.current.classList.toggle("isActive");
  };
  return (
    <Helmet title="Checkout">
      <CommonSection />
      <section>
        <Container>
          <Row>
            <Col lg="8">
              <h6 className="mb-4 fw-bold">Điền thông tin cá nhân</h6>
              <Form className="billing_form">
                <FormGroup className="form_group">
                  <input type="text" placeholder="Họ và tên " />
                </FormGroup>
                <FormGroup className="form_group">
                  <input type="email" placeholder="Email   (nếu có)" />
                </FormGroup>
                <FormGroup className="form_group">
                  <input type="number" placeholder="Số điện thoại" />
                </FormGroup>
                <FormGroup className="form_group">
                  <input type="text" placeholder="Địa chỉ" />
                </FormGroup>
                <FormGroup className="form_group">
                  <input type="text" placeholder="Mã giảm giá" />
                </FormGroup>
              </Form>
            </Col>

            <Col lg="4">
              <div className="check_cart">
                <h6>
                  Số sản phẩm: <span>{totoQty}</span>
                </h6>
                <h6>
                  Tổng số tiền:<span>${totoAmount}</span>
                </h6>
                <h6>
                  Phí vận chuyển:<span>$0</span>
                </h6>

                <h3>
                  Thanh toán: <span>${totoAmount}</span>
                </h3>
              </div>

              <button
                className="btn btn-primary w-100 mt-5"
                onClick={handleClose}>
                Thanh toán
              </button>
            </Col>

            <Col lg="12">
              <div className="wrapper_abate" ref={closeRef}>
                <div className="box_abate">
                  <div className="box_abate-error">
                    <h4>
                      Xin lỗi quý khách ,thanh toán trực tuyến online cửa hàng
                      Hường Mỵ đang gặp lỗi hệ thống. Xin quý khách thanh toán
                      qua phương thức chuyển khoản qua ngân hàng hoặc đến cửa
                      hàng Hường Mỵ.
                      <p style={{ fontSize: "20px", color: "red" }}>
                        Xin cảm ơn
                      </p>
                    </h4>
                  </div>
                  <div className="box_abate-infor">
                    <div className="box_abate-infor-bank">
                      <h4> Tài khoản ngân hàng</h4>
                      <span>
                        Số tài khoản : 3603205212104 <br />
                      </span>
                      <span>
                        Ngân hàng : agribank <br />
                      </span>
                      <span>Tên người nhận : Thái Thị Hường</span>
                    </div>

                    <div className="box_abate-info-zalo">
                      <img
                        src="https://th.bing.com/th/id/R.9752e3478009a7a83378b058d5927ff5?rik=qgLLPPW%2bGyILdg&pid=ImgRaw&r=0"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="abate_close" onClick={handleClose}>
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Checkout;
