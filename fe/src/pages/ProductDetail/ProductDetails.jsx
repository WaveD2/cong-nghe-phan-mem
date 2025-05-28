import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Helmet from "../../components/Helmet/Helmet";
import CommonSelection from "../../components/UI/CommonSelection";
import { Container, Row, Col } from "reactstrap";
import "./ProductDetails.css";
import { motion } from "framer-motion";
import ProductsList from "../../components/UI/ProductList";
import { useDispatch } from "react-redux";
import { cartActions } from "../../redux/slices/cartSlice";
import { toast } from "react-toastify";
import ProductsData from "../../assets/data/products";

// import useGetDataFireBase from "../../custom-hook/useGetDataFireBase";
// import { db } from "../../firebase.config";
// import { doc, getDoc } from "firebase/firestore";

const ProductDetails = () => {
  const { id } = useParams();
  const product = ProductsData.find((item) => item.id === id);
  const dispatch = useDispatch();

  // const [product, setProduct] = useState({});
  const [tab, setTab] = useState("desc");
  const [rating, setRating] = useState(null);
  const reviewUer = useRef("");
  const reviewMess = useRef("");

  //Get data from Firebase
  // const { data: products } = useGetDataFireBase("products");
  // const docRef = doc(db, "product", id);
  // console.log(docRef);
  // useEffect(() => {
  //   const getProduct = async () => {
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       setProduct(doc.data)();
  //     } else {
  //       console.log("no product");
  //     }
  //   };
  //   getProduct();
  // }, []);

  const {
    imgUrl,
    category,
    productName,
    price,
    avgRating,
    reviews,
    description,
    shortDesc,
  } = product;

  const relateProducts = ProductsData.filter(
    (item) => item.category === category
  );

  const submitHandler = (e) => {
    e.preventDefault();

    const reviewUserName = reviewUer.current.value;
    const reviewUserMess = reviewMess.current.value;

    const reviewObjUser = {
      useName: reviewUserName,
      text: reviewUserMess,
      rating,
    };
    toast.success("Đánh giá thành công");
  };

  const addToCart = () => {
    dispatch(
      cartActions.addItem({
        id,
        image: imgUrl,
        productName,
        price,
      })
    );
  };

  return (
    <Helmet title={productName}>
      <CommonSelection />

      <section>
        <Container>
          <Row>
            <Col lg="6">
              <img src={imgUrl} alt="sản phẩm" />
            </Col>
            <Col lg="6">
              <div className="product_details">
                <h2>{productName}</h2>
                <div className="product_rating d-flex al-align-items-center gap-5 mb-4 ">
                  <span>
                    <i className="ri-star-fill"></i>
                  </span>
                  <span>
                    <i className="ri-star-fill"></i>
                  </span>
                  <span>
                    <i className="ri-star-half-line"></i>
                  </span>
                  <span>
                    <i className="ri-star-line"></i>
                  </span>
                  <span>
                    <i className="ri-star-line"></i>
                  </span>
                  <p>
                    (<span>{avgRating}</span>ratings)
                  </p>
                </div>
              </div>
              <div className="d-flex gap-5 align-items-center ">
                <span className="product_price">${price} </span>
                <span> Thuộc loại : {category}</span>
              </div>
              <p className="product_des">{shortDesc}</p>
              <motion.button
                whileTap={{ scale: 1.1 }}
                className="buy_btn"
                onClick={addToCart}>
                Thêm sản phẩm vào giỏ
              </motion.button>
            </Col>
          </Row>
        </Container>
      </section>

      <section>
        <Container>
          <Row>
            <Col lg="12">
              <div className="tab_wrapper d-flex al-align-items-center gap-5 mb-4">
                <h6
                  className={`${tab === "desc" ? "active_tab" : ""}`}
                  onClick={() => setTab("desc")}>
                  Mô tả
                </h6>
                <h6
                  className={`${tab === "rev" ? "active_tab" : ""}`}
                  onClick={() => setTab("rev")}>
                  Đánh giá ({reviews?.length})
                </h6>
              </div>
              {tab === "desc" ? (
                <div className="tab_content mt-5">
                  <p>{description}</p>
                </div>
              ) : (
                <div className="product_review">
                  <div className="review_wrapper ">
                    <ul>
                      {reviews?.map((item, index) => (
                        <li key={index} className="mt-4">
                          <h6>Châu Tinh Tùng</h6>
                          <span>{item.rating}( rating)</span>
                          <p>{item.text}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="review_form">
                      <h4>Chất lượng sản phẩm</h4>
                      <form action="">
                        <div className="form_group">
                          <input
                            type="text"
                            placeholder="tốt , rất tốt"
                            ref={reviewUer}
                          />
                        </div>
                        <div
                          className="form_group rating_group 
                        d-flex al-align-items-center gap-5 ">
                          <motion.span
                            onClick={() => setRating(1)}
                            whileTap={{ scale: 1.1 }}>
                            1<i className="ri-star-half-line"></i>
                          </motion.span>
                          <motion.span
                            onClick={() => setRating(2)}
                            whileTap={{ scale: 1.1 }}>
                            2<i className="ri-star-half-line"></i>
                          </motion.span>
                          <motion.span
                            onClick={() => setRating(3)}
                            whileTap={{ scale: 1.1 }}>
                            3<i className="ri-star-half-line"></i>
                          </motion.span>
                          <motion.span
                            onClick={() => setRating(4)}
                            whileTap={{ scale: 1.1 }}>
                            4<i className="ri-star-half-line"></i>
                          </motion.span>
                          <motion.span
                            onClick={() => setRating(5)}
                            whileTap={{ scale: 1.1 }}>
                            5<i className="ri-star-half-line"></i>
                          </motion.span>
                        </div>

                        <div className="form_group">
                          <textarea
                            type="text"
                            rows={5}
                            required
                            placeholder="Lời nhận xét"
                            ref={reviewMess}
                          />
                        </div>
                        <button
                          type="submit"
                          className="buy_btn"
                          onClick={submitHandler}>
                          Đánh giá
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </Col>

            <Col lg="12" className="mt-5">
              <h2 className="related_title">Sản phẩm bạn có thể thích</h2>
              <div className="d-flex flex-wrap ">
                <ProductsList data={relateProducts} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default ProductDetails;
