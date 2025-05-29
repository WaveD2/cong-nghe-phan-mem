import React, { useState, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import { NavLink, Link } from "react-router-dom";
import useAuth from "../custom-hook/useAuth";
import "./styles.css";
import imgDefaut from "../assets/images/user-icon.png";
import Logo from "../components/UI/Logo";
import Header from "../components/Header/Header";

const admin_nav = [
  { display: "Biểu đồ", path: "/dashboard" },
  { display: "Sản phẩm", path: "/dashboard/all-products" },
  { display: "Tạo sản phẩm", path: "/dashboard/add-product" },
  { display: "Người dùng", path: "/dashboard/users" },
];

const AdminNav = () => {
  const currentUser = useAuth();
  const isActiveCloseMobile = useRef();
  const isActiveMenuMobile = useRef();
  const menuMobileToggle = () => {
    isActiveMenuMobile.current.classList.toggle("menuActive");
    isActiveCloseMobile.current.classList.toggle("menuActive");
  };
  return (
    <section className="admin_menu p-0">
      <Container>
        <Row>
          <Header info={"admin"} />
        </Row>
      </Container>
    </section>
  );
};

export default AdminNav;
// <span>
//               <i className="ri-notification-2-line"></i>
//             </span>
//             <span>
//               <i className="ri-settings-3-line"></i>
//             </span>
