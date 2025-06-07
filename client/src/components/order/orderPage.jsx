import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import apiClient from "../helper/axios";
import { useToast } from "../../context/toastContext";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get("/api/order-service");
        setOrders(response.data.data);
      } catch (error) {
        showToast("Không thể tải danh sách đơn hàng", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await apiClient.patch(`/api/order-service/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 min-h-screen text-white py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Lịch sử đơn hàng</h1>

        {orders && orders.length > 0 ? (
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-xl p-6 mb-4 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Mã đơn hàng: {order._id}</h3>
                    <p className="text-sm text-gray-400">
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-400">
                      Trạng thái: {order.status === "pending" ? "Đang xử lý" : 
                                  order.status === "shipped" ? "Đang giao" : 
                                  order.status === "delivered" ? "Đã giao" : 
                                  order.status === "cancelled" ? "Đã hủy" : "Hoàn thành"}
                    </p>
                    <p className="text-lg font-bold text-blue-400 mt-2">
                      Tổng cộng: {order.totalAmount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Link to={`/order/${order._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <FaEye className="h-5 w-5" />
                      </motion.button>
                    </Link>
                    {order.status === "pending" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancelOrder(order._id)}
                        className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <FaTimes className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Sản phẩm:</h4>
                  {order.items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>{item.price.toLocaleString("vi-VN")} VND</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <FaShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <p className="text-lg mt-4">Bạn chưa có đơn hàng nào</p>
            <Link to="/store">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all"
              >
                Mua sắm ngay
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderHistoryPage;