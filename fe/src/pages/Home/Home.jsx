import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Row, Col } from "reactstrap";

import Helmet from "../../components/Helmet/Helmet";
import ProductList from "../../components/UI/ProductList";
import Service from "../../service";
import HeroImg from "../../assets/images/hero-img.png";
import "./Home.css";
import { toast } from "react-toastify";

const Home = () => {
  
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchProducts = async () => {
    setLoading(true);
      try {
        const response = await fetch("https://smashing-valid-jawfish.ngrok-free.app/api/product-service", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (response.status !== 200) {
          toast.error("Lấy sản phẩm bị lỗi");
        }
        const data = await response.json();
        setTrendingProducts(data.data);

      } catch (error) {
        console.log(error);
      }finally {
        setLoading(false);
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

    </Helmet>
  );
};

export default Home;
