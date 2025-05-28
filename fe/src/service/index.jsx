import React from "react";
import { motion } from "framer-motion";
import { Container, Row, Col } from "reactstrap";
import "./service.css";
import ServiceData from "../assets/data/serviceData";

const index = () => {
  return (
    <section className="services">
      <Container>
        <Row>
          {ServiceData?.map((item, index) => (
            <Col lg="3" md="4" key={index}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="service_item"
                style={{ background: `${item.bg}` }}>
                <span>
                  <i className={item.icon}></i>
                </span>
                <div>
                  <h3 className="service_title">{item?.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default index;
