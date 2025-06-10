import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTruck, FaCheckCircle, FaTimesCircle, FaEdit, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import apiClient from "../../components/helper/axios";
import { useToast } from "../../context/toastContext";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(`/api/order-service/${id}`);
        setOrder(response.data.data);
        setStatus(response.data.data.status);
      } catch (error) {
        showToast("Không thể tải thông tin đơn hàng", "error");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate, showToast]);

  const handleStatusChange = async () => {
    try {
      await apiClient.put(`/api/order-service/${id}`, { status });
      showToast("Cập nhật trạng thái thành công", "success");
      setIsEditing(false);
    } catch (error) {
      showToast("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const statusOptions = [
    { value: "pending", label: "Đang xử lý", color: "bg-yellow-500" },
    { value: "shipped", label: "Đã giao", color: "bg-blue-500" },
    { value: "delivered", label: "Đã nhận", color: "bg-green-500" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-200 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-blue-500 border-gray-600 rounded-full"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-500 to-gray-400 text-white">
        <p className="text-xl">Đơn hàng không tồn tại</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=" min-h-screen text-white py-12"
    >
      <div className="">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Chi Tiết Đơn Hàng #{order._id.slice(-6)}
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Thông tin đơn hàng */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-300">Thông Tin Đơn Hàng</h2>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusOptions.find((opt) => opt.value === order.status)?.color
                  }`}
                >
                  {statusOptions.find((opt) => opt.value === order.status)?.label}
                </span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <FaEdit />
                </button>
              </div>
            </div>

            {/* Chỉnh sửa trạng thái */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <label className="block text-sm font-medium mb-2 text-gray-200">Cập nhật trạng thái</label>
                  <div className="flex space-x-4">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStatusChange}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Lưu
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sản phẩm */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Sản Phẩm</h3>
              <AnimatePresence>
                {order.items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center mb-4 bg-gray-700/30 rounded-lg p-4"
                  >
                    <img
                      src={item.productId.thumbnail}
                      alt={item.productId.title}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productId.title}</p>
                      <p className="text-sm text-gray-400">Số lượng: {item.quantity}</p>
                      <p className="text-sm text-gray-400">
                        Đơn giá: {item.productId.discountedPrice.toLocaleString("vi-VN")} VND
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {(item.quantity * item.productId.discountedPrice).toLocaleString("vi-VN")} VND
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Tổng tiền */}
            <div className="flex justify-between pt-4 border-t border-gray-600/50">
              <span className="text-lg font-semibold text-gray-200">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-400">
                {order.totalAmount.toLocaleString("vi-VN")} VND
              </span>
            </div>
          </motion.div>

          {/* Thông tin khách hàng và giao hàng */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 sticky top-4"
          >
            <h2 className="text-2xl font-semibold mb-6 text-blue-300">Thông Tin Khách Hàng</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Tên khách hàng</p>
                <p className="text-gray-200">{order.userId.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-gray-200">{order.userId.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Số điện thoại</p>
                <p className="text-gray-200">{order.userId.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Địa chỉ giao hàng</p>
                <p className="text-gray-200">
                  {order.shippingAddress.detail}, {order.shippingAddress.state}, {order.shippingAddress.street}, {order.shippingAddress.city}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phương thức thanh toán</p>
                <p className="text-gray-200 flex items-center">
                  {order.paymentMethod === "cod" ? (
                    <>
                      <FaMoneyBillWave className="mr-2 text-green-400" /> Thanh toán khi nhận hàng
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2 text-blue-400" /> Thẻ tín dụng
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trạng thái thanh toán</p>
                <p className="text-gray-200 flex items-center">
                  {order.isPaid ? (
                    <>
                      <FaCheckCircle className="mr-2 text-green-400" /> Đã thanh toán
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="mr-2 text-red-400" /> Chưa thanh toán
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trạng thái giao hàng</p>
                <p className="text-gray-200 flex items-center">
                  {order.isDelivered ? (
                    <>
                      <FaCheckCircle className="mr-2 text-green-400" /> Đã giao
                    </>
                  ) : (
                    <>
                      <FaTruck className="mr-2 text-blue-400" /> Chưa giao
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Ngày đặt hàng</p>
                <p className="text-gray-200">{new Date(order.orderDate).toLocaleString("vi-VN")}</p>
              </div>
              {order.shippedDate && (
                <div>
                  <p className="text-sm text-gray-400">Ngày giao hàng</p>
                  <p className="text-gray-200">{new Date(order.shippedDate).toLocaleString("vi-VN")}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetailPage;