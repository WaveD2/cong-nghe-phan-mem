import { Navigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/CheckOut";
import Shop from "../pages/Shop/Shop";
import ProductDetails from "../pages/ProductDetail";
import Signup from "../pages/Form/SignUp";
import Login from "../pages/Form/Login";
import AllProducts from "../admin/AllProducts";
import AddProducts from "../admin/AddProducts";
import Dashboard from "../admin/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import User from "../admin/User";
import PageError from "../components/Error/404";
import Heart from "../pages/Cart/Heart";
import Demo from "../pages/demo/demo";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />}></Route>
      <Route path="/home" element={<Home />}></Route>
      <Route path="/*" element={<PageError />} />

      <Route path="/" element={<ProtectedRoute />}>
        <Route path="checkout" element={<Checkout />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/all-products" element={<AllProducts />} />
        <Route path="dashboard/add-product" element={<AddProducts />} />
        <Route path="dashboard/users" element={<User />} />
        <Route path="dashboard/demo" element={<Demo />} />
      </Route>

      <Route path="/*" element={<ProtectedRoute />}>
        <Route path="cart" element={<Cart />} />
        <Route path="heart" element={<Heart />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:id" element={<ProductDetails />} />
      </Route>
      <Route path="/login" element={<Login />}></Route>

      <Route path="/signup" element={<Signup />}></Route>
    </Routes>
  );
};

export default Routers;
