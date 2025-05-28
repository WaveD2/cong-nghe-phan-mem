import React, { useRef, useEffect } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { Container, Row } from "reactstrap";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useAuth from "../../custom-hook/useAuth";
import logo from "../../assets/images/eco-logo.png";
import imgUser from "../../assets/images/user-icon.png";
import "./Header.css";

const Nav_link = [
  { path: "home", display: "Trang chủ" },
  { path: "shop", display: "Sản phẩm" },
  { path: "cart", display: "Giỏ hàng" },
];

const Nav_admin = [
  { path: "/dashboard", display: "Biểu đồ" },
  { path: "/dashboard/all-products", display: "Sản phẩm" },
  { path: "/dashboard/add-product", display: "Tạo sản phẩm" },
  { path: "/dashboard/users", display: "Người dùng" },
];

const Header = ({ info }) => {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();

  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const profileActionRef = useRef(null);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const totalHeart = useSelector((state) => state.cart.totalHeart);
  const menuItemNav = info === "admin" ? Nav_admin : Nav_link;
  const roleCheckAdmin = "admin@example.com"; // Replace with actual admin check logic

  // Sticky header functionality
  useEffect(() => {
    const stickyHeaderFunc = () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("sticky_header");
      } else {
        headerRef.current.classList.remove("sticky_header");
      }
    };

    window.addEventListener("scroll", stickyHeaderFunc);
    return () => window.removeEventListener("scroll", stickyHeaderFunc);
  }, []);

  // Toggle mobile menu
  const menuToggle = () => {
    menuRef.current.classList.toggle("active_menu");
  };

  // Toggle profile dropdown
  const toggleProfileAction = () => {
    profileActionRef.current.classList.toggle("show_profile_action");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/home");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      toast.error("Đăng xuất thất bại");
    }
    toggleProfileAction();
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileActionRef.current &&
        !profileActionRef.current.contains(event.target)
      ) {
        profileActionRef.current.classList.remove("show_profile_action");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  console.log("Current User:", currentUser);
  
  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav_wrapper" 
          >
            <Link to="/home" className="logo">
              <img src={logo} alt="Logo" aria-label="Trang chủ" />
            </Link>

            <div className="navigation" ref={menuRef}>
              <ul className="menu">
                {menuItemNav.map((item, index) => (
                  <li className="nav_item" key={index}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive ? "nav_active" : ""
                      }
                    >
                      {item.display}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="nav_icons">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="heart_icon"
                onClick={() => currentUser && navigate("/heart")}
                role="button"
                aria-label={`Danh sách yêu thích (${totalHeart} mục)`}
              >
                <i className="ri-heart-line"></i>
                {totalHeart > 0 && <span className="badge">{totalHeart}</span>}
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="cart_icon"
                onClick={() => navigate("/cart")}
                role="button"
                aria-label={`Giỏ hàng (${totalQuantity} mục)`}
              >
                <i className="ri-shopping-bag-line"></i>
                {totalQuantity > 0 && (
                  <span className="badge">{totalQuantity}</span>
                )}
              </motion.span>

              <div className="profile_container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  src={currentUser?.avatar || imgUser}
                  alt="Ảnh đại diện"
                  className="profile"
                  onClick={toggleProfileAction}
                  role="button"
                  aria-label="Tài khoản người dùng"
                />
                <div
                  className="profile_action"
                  ref={profileActionRef}
                  role="menu"
                >
                  {currentUser ? (
                    <div className="profile_menu">
                      <span
                        className="profile_item"
                        onClick={handleLogout}
                        role="menuitem"
                        aria-label="Đăng xuất"
                      >
                        Đăng xuất
                      </span>
                      {currentUser.email === roleCheckAdmin && (
                        <Link
                          to="/dashboard"
                          className="profile_item"
                          onClick={toggleProfileAction}
                          role="menuitem"
                          aria-label="Bảng điều khiển"
                        >
                          Bảng điều khiển
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="profile_menu">
                      <Link
                        to="/login"
                        className="profile_item"
                        onClick={toggleProfileAction}
                        role="menuitem"
                        aria-label="Đăng nhập"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/signup"
                        className="profile_item"
                        onClick={toggleProfileAction}
                        role="menuitem"
                        aria-label="Đăng ký"
                      >
                        Đăng ký
                      </Link>
                    </div>
                  )}
                </div>
                <p>{currentUser?.name}</p>
              </div>

              <div className="mobile_menu">
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  onClick={menuToggle}
                  role="button"
                  aria-label="Mở/đóng menu di động"
                >
                  <i className="ri-menu-line"></i>
                </motion.span>
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;