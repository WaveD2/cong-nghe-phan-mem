import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Spinner } from "reactstrap";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import ProductsList from "../../components/UI/ProductList";
import { cartActions } from "../../redux/slices/cartSlice";
import "./ProductDetails.css";
import { convertVND } from "../../utils/convertVND";



const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Thêm vào đầu file
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://smashing-valid-jawfish.ngrok-free.app/api/product-service/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.status !== 200) {
          toast.error("Lấy sản phẩm bị lỗi");
        }
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://smashing-valid-jawfish.ngrok-free.app/api/product-service/?limit=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.status !== 200) {
          toast.error("Lấy sản phẩm bị lỗi");
        }
        const data = await response.json();
        setRelatedProducts(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    fetchRelatedProducts();
  }, [id]);

  const handleQuantityChange = (value) => {
    if (value < 1) setQuantity(1);
    else if (value > product?.stock) setQuantity(product.stock);
    else setQuantity(value);
  };

  const addToCart = () => {
    if (product) {
      dispatch(
        cartActions.addItem({
          id: product.id,
          image: product.img,
          productName: product.name,
          price: product.price,
          quantity,
        })
      );
      toast.success("Sản phẩm đã được thêm vào giỏ hàng");
    }
  };

  const handlerMuahang = () => {
    if (product) {
      dispatch(
        cartActions.addItem({
          id: product.id,
          image: product.img,
          productName: product.name,
          price: product.price,
          quantity,
        })
      );
      navigate('/cart');
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
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

  if (!product) {
    return (
      <Container className="text-center mt-5">
        <h4>Sản phẩm không tồn tại</h4>
      </Container>
    );
  }

  return (
    <Container>
      <section>
        <Container>
          <Row>
            <Col lg="6">
              <motion.img
                src={product?.img}
                alt={product?.name}
                className="img-fluid rounded"
                style={{ maxHeight: "500px", objectFit: "cover" }}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                loading="lazy"
              />
            </Col>
            <Col lg="6">
              <motion.div
                className="product_details p-4 bg-light rounded shadow-sm"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="mb-3 text-primary fw-bold">{product?.name}</h2>

                <div className="d-flex align-items-center gap-4 mb-3">
                  <span className="h5 text-danger">{convertVND(product?.price.toString())} VNĐ</span>
                  <span
                    className={`badge ${
                      product.stock > 0 ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {product.stock > 0
                      ? `Còn ${product.stock} sản phẩm`
                      : "Hết hàng"}
                  </span>
                </div>

                <p className="text-muted mb-4">{product?.description}</p>

                <div className="d-flex align-items-center gap-3 mb-4">
                  <label className="form-label m-0 fw-semibold">
                    Số lượng:
                  </label>
                  <div className="input-group" style={{ maxWidth: "130px" }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={(e) =>
                        handleQuantityChange(Number(e.target.value))
                      }
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="w-full d-flex align-items-center justify-content-between">
                <motion.button
                  style={{ marginRight: "30px" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary w-50 fw-semibold"
                  onClick={addToCart}
                  disabled={product?.stock === 0}
                >
                  <i className="ri-shopping-cart-line me-2"></i>
                  {product?.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary w-50 py-2 fw-semibold"
                  onClick={handlerMuahang}
                  disabled={product?.stock === 0}
                >
                  <i class="ri-luggage-cart-fill"></i>
                  Mua ngay
                </motion.button>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      <section>
        <Container>
          <Row>
            <Col lg="12">
              <h2 className="related_title" style={{ fontSize: "20px", fontFamily: "serif", fontWeight: "bold" }}>Sản phẩm bạn có thể thích</h2>
              <div className="d-flex flex-wrap">
                <ProductsList data={relatedProducts} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Container>
  );
};

export default ProductDetail;
