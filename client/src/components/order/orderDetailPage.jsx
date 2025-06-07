import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaShoppingCart, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { useParams, Link } from "react-router-dom";
import apiClient from "../helper/axios";
import { useToast } from "../../context/toastContext";
const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { showToast } = useToast();

  // Lấy thông tin chi tiết đơn hàng
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(`/api/order-service/${id}`);
        setOrder(response.data.data);
      } catch (error) {
        showToast("Không thể tải chi tiết đơn hàng", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    try {
      const response = await apiClient.patch(`/api/order-service/${id}/cancel`);
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
      showToast(response.data.message, "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi hủy đơn hàng", "error");
    }
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

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 min-h-screen text-white py-12"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
          <p className="text-lg mt-4">Không tìm thấy đơn hàng</p>
          <Link to="/orders">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover{HO bg-blue-700 transition-all"
            >
              Quay lại lịch sử đơn hàng
            </motion.button>
          </Link>
        </div>
      </motion.div>
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Chi tiết đơn hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin đơn hàng */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mã đơn hàng: {order._id}</h2>
              {order.status === "pending" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelOrder}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition-all"
                >
                  <FaTimes className="h-4 w-4" />
                  Hủy đơn hàng
                </motion.button>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-2">
              Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Trạng thái: {order.status === "pending" ? "Đang xử lý" :
                          order.status === "shipped" ? "Đang giao" :
                          order.status === "delivered" ? "Đã giao" :
                          order.status === "cancelled" ? "Đã hủy" : "Hoàn thành"}
            </p>
            <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
            <AnimatePresence>
              {order.items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center border-b border-gray-600 py-4"
                >
                  <img
                    src={item.productId?.thumbnail}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-blue-400">{item.price.toLocaleString("vi-VN")} VND</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Thông tin giao hàng và thanh toán */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 shadow-md sticky top-4"
          >
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="flex items-start mb-4">
              <FaMapMarkerAlt className="h-5 w-5 mr-2 text-blue-400" />
              <div>
                <p className="text-sm">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                {order.shippingAddress.detail && (
                  <p className="text-sm text-gray-400">{order.shippingAddress.detail}</p>
                )}
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="flex items-center mb-4">
              {order.paymentMethod === "cod" ? (
                <FaMoneyBillWave className="h-5 w-5 mr-2 text-blue-400" />
              ) : (
                <FaCreditCard className="h-5 w-5 mr-2 text-blue-400" />
              )}
              <p className="text-sm">
                {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Thẻ tín dụng"}
              </p>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-600">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="font-bold text-blue-400">
                {order.totalAmount.toLocaleString("vi-VN")} VND
              </span>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/orders">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all"
            >
              Quay lại lịch sử đơn hàng
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetailPage;