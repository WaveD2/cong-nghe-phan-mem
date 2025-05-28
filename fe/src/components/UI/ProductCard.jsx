import React from "react";
import { motion } from "framer-motion";
import { Col } from "reactstrap";
import "./styles.css";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cartActions } from "../../redux/slices/cartSlice";
import { convertVND } from "../../utils/convertVND";

const ProductCard = ({ item }) => {
  const dispatch = useDispatch();
  const addToCart = () => {
    dispatch(
      cartActions.addItem({
        id: item.id,
        productName: item.productName,
        price: item.price,
        image: item.imgUrl,
      })
    );
  };
  const addToHeart = () => {
    dispatch(
      cartActions.addHeart({
        id: item.id,
        productName: item.productName,
        price: item.price,
        image: item.imgUrl,
      })
    );
  };

  return (
    <Col lg="3" md="4">
      <div className="product_card">
        <div className="product_img">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={item.imgUrl}
            alt="ghế bông"
            style={{ width: 300, height: 300, borderRadius: 8 }}
          />
        </div>
        <div className="p-2 product_info">
          <h3 className="product_name">
            <Link to={`/shop/${item.id}`}>{item.productName}</Link>
          </h3>
          <span className="text-center">{item.category}</span>
        </div>
        <div className="product_cart-bottom d-flex align-items-center justify-content-between p-2">
          <span className="price">
            {convertVND(item.price.toString())} đồng
          </span>
          <div>
            <motion.span
              whileTap={{ scale: 1.2 }}
              onClick={addToHeart}
              className="mx-2">
              <i className="ri-heart-line"></i>
            </motion.span>
            <motion.span whileTap={{ scale: 1.2 }} onClick={addToCart}>
              <i className="ri-add-line"></i>
            </motion.span>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default ProductCard;
