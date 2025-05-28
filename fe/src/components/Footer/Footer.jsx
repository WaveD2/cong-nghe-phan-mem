import React from "react";
import "./Footer.css";
import logo from "../../assets/images/eco-logo.png";
import { Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { Link } from "react-router-dom";
const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col lg="4">
            <div className="logo d-flex justify-content-start ">
              <h1>WaveD</h1>
            </div>
            <div>
              <p className="footer_text mt-3">
                Cửa hàng Hường Mỵ chuyên sỉ lẻ quần áo - giày dép trẻ em. Cam
                kết chất lượng về sản phẩm. Hỗ trợ ship và giao hàng trên toàn
                quốc. Đổi trả sản phẩm miễn phí
              </p>
            </div>
          </Col>

          <Col lg="3" className="menuMobile">
            <div className="footer_quick-links">
              <h4 className="quick_links-title">Sản phẩm </h4>
              <ListGroup className="footer_box">
                <ListGroupItem className="ps-0 border-0">
                  <Link to="#">Bàn ghế</Link>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <Link to="#">Ghế Sofa</Link>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <Link to="#">Điện thoại </Link>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <Link to="#">Đồng hồ thông minh</Link>
                </ListGroupItem>
              </ListGroup>
            </div>
          </Col>

          <Col lg="2" className="menuMobile">
            <div className="footer_quick-links">
              <h4 className="quick_links-title">Menu</h4>
              <ListGroup className="footer_box">
                <ListGroupItem className="ps-0 border-0">
                  <Link to="/shop">Cửa hàng</Link>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <Link to="/cart">Giỏ hàng</Link>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <Link to="/login">Đăng nhập</Link>
                </ListGroupItem>
              </ListGroup>
            </div>
          </Col>

          <Col lg="3">
            <div className="footer_quick-links">
              <h4 className="quick_links-title">Liên hệ</h4>
              <ListGroup className="footer_box">
                <ListGroupItem className="ps-0 border-0">
                  <span>
                    <i className="ri-map-pin-2-line"></i>
                    <p className="footer_box-des">
                      Khu chợ mới Thị Trấn - Đô Lương
                    </p>
                  </span>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <span>
                    <i className="ri-phone-line"></i>
                    <p className="footer_box-des">09882335**</p>
                  </span>
                </ListGroupItem>
                <ListGroupItem className="ps-0 border-0">
                  <span>
                    <i className="ri-mail-line"></i>
                    <p className="footer_box-des">tungdev64@gmail.com</p>
                  </span>
                </ListGroupItem>
              </ListGroup>
            </div>
          </Col>

          <Col lg="12">
            <div className="copy_right">
              <p>
                Copyright by <span className="text-bg-danger">@WaveD</span>{" "}
                {year}
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
