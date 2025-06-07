import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCreditCard, FaMoneyBillWave, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../helper/axios";
import { useToast } from "../../context/toastContext";

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    detail: "",
    paymentMethod: "cod",
  });
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Lấy thông tin giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await apiClient.get("/api/cart-service");
        setCart(response.data.data);
      } catch (error) {
        showToast("Không thể tải giỏ hàng", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý tạo đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/order-service", formData);
      showToast(response.data.message, "success");
      navigate("/orders");
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi tạo đơn hàng", "error");
    }
  };

  // Tính tổng giá
  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.productId.discountedPrice * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-t-blue-500 border-gray-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 min-h-screen text-white py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Thanh toán</h1>

        {cart && cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form thông tin giao hàng */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Đường</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Xã/Quận/Thành phố</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tỉnh/Thành</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Chi tiết (không bắt buộc)</label>
                  <textarea
                    name="detail"
                    value={formData.detail}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="text-blue-500"
                      />
                      <span className="flex items-center"><FaMoneyBillWave className="mr-1" /> Thanh toán khi nhận hàng</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                        className="text-blue-500"
                      />
                      <span className="flex items-center"><FaCreditCard className="mr-1" /> Thẻ tín dụng</span>
                    </label>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  Đặt hàng
                </motion.button>
              </form>
            </motion.div>

            {/* Tổng kết đơn hàng */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 rounded-xl p-6 shadow-md sticky top-4"
            >
              <h2 className="text-xl font-semibold mb-4">Tổng kết đơn hàng</h2>
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between mb-2"
                  >
                    <span className="text-sm">{item.productId.title} (x{item.quantity})</span>
                    <span className="text-sm font-medium">
                      {(item.productId.discountedPrice * item.quantity).toLocaleString("vi-VN")} VND
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-600">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="font-bold text-blue-400">
                  {calculateTotal().toLocaleString("vi-VN")} VND
                </span>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <FaShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <p className="text-lg mt-4">Giỏ hàng của bạn đang trống</p>
            <Link to="/store">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all"
              >
                Tiếp tục mua sắm
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CheckoutPage;