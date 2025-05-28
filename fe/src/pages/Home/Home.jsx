import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Row, Col } from "reactstrap";

import Helmet from "../../components/Helmet/Helmet";
import ProductList from "../../components/UI/ProductList";
import Service from "../../service";
import Clock from "../../components/UI/Clock";
import useGetDataFireBase from "../../custom-hook/useGetDataFireBase";

import dataProductCarts from "../../assets/data/products";
import counterImg from "../../assets/images/counter-timer-img.png";
import HeroImg from "../../assets/images/hero-img.png";
import "./Home.css";
import { getProducts } from "../../api/productService";
import axios from "axios";

const Home = () => {
  
  const { data: product, loading } = useGetDataFireBase("products");
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSalesProducts, setBestSalesProducts] = useState([]);
  const [wirelessProducts, setWirelessProducts] = useState([]);
  const [mobileProducts, setMobileProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect( () => {
    const filterTrendingProduct = dataProductCarts.filter(
      (item) => item.category === "chair"
    );
    const filterBestSalesProduct = dataProductCarts.filter(
      (item) => item.category === "sofa"
    );
    const filterWirelessProduct = dataProductCarts.filter(
      (item) => item.category === "wireless"
    );
    const filterMobileProduct = dataProductCarts.filter(
      (item) => item.category === "mobile"
    );
    const filterPopularProduct = dataProductCarts.filter(
      (item) => item.category === "watch"
    );

    setTrendingProducts(filterTrendingProduct);
    setBestSalesProducts(filterBestSalesProduct);
    setWirelessProducts(filterWirelessProduct);
    setMobileProducts(filterMobileProduct);
    setPopularProducts(filterPopularProduct);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://smashing-valid-jawfish.ngrok-free.app/api/product-service", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        
        console.log("response", response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Helmet title="Home">
      <section className="hero_section">
        <Container>
          <Row>
            <Col lg="6" md="6">
              <div className="hero_content">
                <h1>Shop Hường Mỵ</h1>
                <h2>Uy tín, chất lượng làm nên thương hiệu</h2>
                <p>
                  Cửa hàng{" "}
                  <span
                    style={{
                      fontSize: "24px",
                      color: "var( --primary-color)",
                    }}>
                    Hường Mỵ{" "}
                  </span>
                  chuyên sỉ lẻ bàn ghế - nội thất <br />
                  Liên hệ : 0988233528
                </p>

                <motion.button whileTap={{ scale: 1.2 }} className="buy_btn ">
                  <Link to="/shop">MUA HÀNG NGAY !</Link>
                </motion.button>
              </div>
            </Col>

            <Col lg="6" md="6">
              <div className="hero_img">
                <img src={HeroImg} alt="bàn ghế đẹp" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Service />

      <section className="trending_products">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Sản phẩm bán chạy</h2>
            </Col>
            {loading ? (
              <h5 className="fw-bold py-2">Loading...</h5>
            ) : (
              <ProductList data={trendingProducts} isBtn={true} />
            )}
          </Row>
        </Container>
      </section>

      <section className="best_sales">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Sản phẩm Seal</h2>
            </Col>
            <ProductList data={bestSalesProducts} isBtn={true} />
          </Row>
        </Container>
      </section>

      <section className="timer_count">
        <Container>
          <Row>
            <Col lg="6" md="12">
              <div className="clock_top-content">
                <h4 className="text-white fs-6 mb-2">Siêu phẩm giảm giá</h4>
                <h3 className="text-white fs-5 mb-3">Bắt đầu sau</h3>
              </div>
              <Clock />
              <motion.button
                whileTap={{ scale: 1.1 }}
                className="buy_btn store_btn">
                <Link to="/shop">Khám phá ngay bây giờ</Link>
              </motion.button>
            </Col>
            <Col lg="6" md="12" className="text-end counter_img">
              <img src={counterImg} alt="bàn ghế êm" />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="new_arrivals">
        <Container>
          <Row>
            <Col lg="12" className="text-center mb-5">
              <h2 className="section__title">Điện thoại & Tai nghe</h2>
            </Col>
            <ProductList data={wirelessProducts} />
            <ProductList data={mobileProducts} />
          </Row>
        </Container>
      </section>

      <section className="popular_category">
        <Container>
          <Row>
            <Col lg="12" className="text-center mb-5">
              <h2 className="section__title">Đồng Hồ</h2>
            </Col>
            <ProductList data={popularProducts} />
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Home;
