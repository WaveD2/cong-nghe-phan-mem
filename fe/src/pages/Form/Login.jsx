import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Helmet from "../../components/Helmet/Helmet"; // Ensure this path and export are correct
import { Container, Row, Col, Form, FormGroup, Button, Spinner } from "reactstrap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase.config";
import useAuth from "../../custom-hook/useAuth";
import "./login.css"; // Updated CSS path for consistency

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle Google login
  const handleLoginGG = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Đăng nhập Google thành công");
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      toast.error("Đăng nhập Google thất bại");
    }
  };

  // Handle Facebook login
  const handleLoginFB = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Đăng nhập Facebook thành công");
    } catch (error) {
      console.error("Lỗi đăng nhập Facebook:", error);
      toast.error("Đăng nhập Facebook thất bại");
    }
  };

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success("Đăng nhập thành công");
      if (result.data?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } else {
      toast.error(`Sai thông tin đăng nhập: ${result.error}`);
    }
  };

  // Redirect if already logged in
  if (currentUser) {
    if (currentUser.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
    return null;
  }

  return (
    <Helmet title="Đăng nhập">
      <section className="login-section">
        <Container>
          <Row>
            {loading ? (
              <Col className="text-center">
                <Spinner color="primary" />
                <h4 className="mt-3">Đang tải...</h4>
              </Col>
            ) : (
              <Col lg="6" md="8" sm="10" className="m-auto">
                <div className="login-card">
                  <h3 className="login-title">Đăng nhập</h3>
                  <Form className="auth-form" onSubmit={handleLogin}>
                    <FormGroup className="form-group">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-label="Email"
                        className="form-control"
                      />
                    </FormGroup>
                    <FormGroup className="form-group">
                      <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-label="Mật khẩu"
                        className="form-control"
                      />
                    </FormGroup>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="auth-btn"
                      disabled={loading}
                      aria-label="Đăng nhập"
                    >
                      Đăng nhập
                    </motion.button>
                    <p className="signup-link">
                      Bạn chưa có tài khoản?{" "}
                      <Link to="/signup">Tạo tài khoản miễn phí</Link>
                    </p>
                  </Form>
                  <div className="social-login">
                    <Button
                      color="primary"
                      outline
                      className="social-btn google-btn"
                      onClick={handleLoginGG}
                      disabled={loading}
                      aria-label="Đăng nhập bằng Google"
                    >
                      <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google icon"
                        className="social-icon"
                      />
                      Đăng nhập bằng Google
                    </Button>
                    <Button
                      color="primary"
                      outline
                      className="social-btn facebook-btn"
                      onClick={handleLoginFB}
                      disabled={loading}
                      aria-label="Đăng nhập bằng Facebook"
                    >
                      <img
                        src="https://www.facebook.com/favicon.ico"
                        alt="Facebook icon"
                        className="social-icon"
                      />
                      Đăng nhập bằng Facebook
                    </Button>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Login;