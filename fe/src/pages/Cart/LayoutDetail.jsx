import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import CommonSection from "../../components/UI/CommonSelection";
import Helmet from "../../components/Helmet/Helmet";
import { motion } from "framer-motion";
import { cartActions } from "../../redux/slices/cartSlice";
import { useSelector, useDispatch } from "react-redux";

import "./Cart.css";

const LayoutDetail = ({ info }) => {
  const cartItem = useSelector((state) => state.cart.cartItems);
  const cartHeart = useSelector((state) => state.cart.cartHeart);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  let listCarts = info ? cartHeart : cartItem;
  return (
    <Helmet title={info}>
      <CommonSection />
      <section>
        <Container>
          <Row>
            <Col lg="9">
              {listCarts.length === 0 ? (
                <h1 className="">Bạn chưa chọn sản phẩm</h1>
              ) : (
                <table className="table bordered">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên</th>
                      <th>Gía tiền</th>
                      <th>Số lượng</th>
                      <motion.th whileTap={{ scale: 1.1 }}>
                        {info === "heart"
                          ? "Xóa khỏi danh mục yêu thích"
                          : "Xóa khỏi giỏ hàng"}
                      </motion.th>
                    </tr>
                  </thead>
                  <tbody>
                    {listCarts?.map((item, index) => (
                      <Tr item={item} key={index} info={info} />
                    ))}
                  </tbody>
                </table>
              )}
            </Col>
            {info === "heart" || (
              <Col lg="3">
                <div className="">
                  <h6 className="d-flex align-items-center justify-content-between ">
                    Gía tiền
                  </h6>
                  <span className="fs-4 fw-bold">${totalAmount}</span>
                </div>

                <div>
                  <button className="buy_btn w-100">
                    <Link to="/shop">Tiếp tục mua hàng</Link>
                  </button>
                  <button className="buy_btn w-100 mt-2">
                    <Link to="/checkout">Thanh toán</Link>
                  </button>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};
const Tr = ({ item, info }) => {
  const dispatch = useDispatch();
  const deleteProduct = () => {
    info === "heart "
      ? dispatch(cartActions.deleteItem(item.id))
      : dispatch(cartActions.deleteHeart(item.id));
  };

  return (
    <tr>
      <td>
        <img src={item.image} alt="sản phẩm" />
      </td>
      <td>{item.productName}</td>
      <td>${item.price}</td>
      <td>{item.quantityProduct}</td>
      <motion.td style={{ cursor: "pointer" }}>
        <i className="ri-delete-bin-line" onClick={deleteProduct}></i>
      </motion.td>
    </tr>
  );
};
export default LayoutDetail;
