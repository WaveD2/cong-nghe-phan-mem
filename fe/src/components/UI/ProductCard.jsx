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
        id: item?.id || item?._id,
        productName: item.name,
        price: item.price,
        image: item?.image || item.img,
      })
    );
  };
  const addToHeart = () => {
    dispatch(
      cartActions.addHeart({
        id: item?.id || item?._id,
        productName: item.name,
        price: item.price,
        image: item?.image || item.img,
        category: item.category,
      })
    );
  };

  return (
    <Col lg="3" md="4" className="">
      <div className="product_card">
        <div className="product_img" style={{ position: "relative" }}>
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={item?.img || item?.image}
            alt={item.name}
            loading="lazy"
            style={{ width: 250, height: 300, borderRadius: 8 }}
          />
             <motion.span
              whileTap={{ scale: 1.2 }}
              onClick={addToHeart}
              className="mx-2" style={{
                position: "absolute",
                top: 10,
                right: 10,
                cursor: "pointer",
                color: "rgba(255, 0, 0, 0.7)",
              }}>
              <i className="ri-heart-line" style={{ fontSize: 30 }}></i>
            </motion.span>
        </div>
        <div className="p-2 product_info">
          <h3 className="product_name">
            <Link to={`/product/${item._id}`}>{item.name}</Link>
          </h3>
          <span className="text-center">{item.description}</span>
        </div>
        <div className="product_cart-bottom p-2" style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
         <> <span className="price" style={{ fontSize: "20px", fontWeight: "bold" }}>
            {convertVND(item.price.toString())} VNĐ
          </span></>
          <div>
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
