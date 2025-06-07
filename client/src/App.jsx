import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./components/auth/login";
import Store from "./components/products/store";
import Register from "./components/auth/register";
import ProtectedRoute from "./components/auth/protectedRoute";
import { AuthProvider } from "./context/authContext";
import Error404 from "./pages/Error404";
import ProductProvider from "./context/productContext";
import Layout from "./Layout";
import ProductDetails from "./components/products/productDetailsIndividual/productDetails";
import CartPage from "./components/cart/CartPage";
import CheckoutPage from "./components/order/checkoutpage";
import ContactForm from "./pages/contact";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/adminDashboard";
import ManageProducts from "./pages/admin/manageProducts";
import ManageUsers from "./pages/admin/manageUsers";
import ManageProductIndividual from "./pages/admin/manageProductIndividual";
import ManageUserIndividual from "./pages/admin/manageUsersIndividual";
import ManageOrder from "./pages/admin/manageOrder";
import ManageOrderUpdate from "./pages/admin/manageOrderUpdate";
import { ToastProvider } from "./context/toastContext";
import Logout from "./components/auth/logout";
import CreateProductForm from "./pages/admin/createProducts";
import CustomerDashboard from "./pages/client/dashboard";
import CustomerLayout from "./pages/client/customerLayout";
import CustomerOrder from "./pages/client/customerOrder";
import ForgotPassword from "./components/auth/forgotPassword";
import UserDetail from "./components/user/userDetail";
import OrderHistoryPage from "./components/order/orderPage";
import OrderDetailPage from "./components/order/orderDetailPage";

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <ProductProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<ContactForm />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/" element={<Home />} />

                <Route path="/">
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute
                        allowedRoles={["admin"]}
                        redirectTo="/dashboard"
                      />
                    }
                  >
                    <Route element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<ManageProducts />} />
                      <Route
                        path="products/:id"
                        element={<ManageProductIndividual />}
                      />
                      <Route
                        path="products/create"
                        element={<CreateProductForm />}
                      />
                      <Route path="users" element={<ManageUsers />} />
                      <Route
                        path="users/:id"
                        element={<ManageUserIndividual />}
                      />
                      <Route path="orders" element={<ManageOrder />} />
                      <Route
                        path="orders/:id"
                        element={<ManageOrderUpdate />}
                      />
                    </Route>
                  </Route>

                  <Route
                    path="customer"
                    element={
                      <ProtectedRoute
                        allowedRoles={["user", "admin"]}
                        redirectTo="/dashboard/customer"
                      />
                    }
                  >
                    <Route element={<CustomerLayout />}>
                      <Route index element={<CustomerDashboard />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="orders" element={<CustomerOrder />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="/store" element={<Store />} />

                <Route path="/store/:id" element={<ProductDetails />} />

                <Route
                  element={
                    <ProtectedRoute allowedRoles={["admin", "user"]} />
                  }
                >
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/user/:id" element={<UserDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/order/:id" element={<OrderDetailPage />} />

                </Route>

                <Route path="*" element={<Error404 />} />
              </Route>
            </Routes>
          </ProductProvider>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
