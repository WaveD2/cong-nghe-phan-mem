import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import apiClient from "../helper/axios";
import { useToast } from "../../context/toastContext";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (productId) => {
    try {
      await apiClient.delete(`/api/cart-service/item/${productId}`);
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.productId._id !== productId),
      }));
      showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    } catch (error) {
      showToast("Không thể xóa sản phẩm", "error");
    }
  };

  // Cập nhật số lượng sản phẩm
  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await apiClient.put("/api/cart-service/quantity", { id: productId, quantity: newQuantity });
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.productId._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));
      showToast("Cập nhật số lượng thành công", "success");
    } catch (error) {
      showToast("Không thể cập nhật số lượng", "error");
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
          className="w-12 h-12 border-4 border-t-white border-gray-600 rounded-full"
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Giỏ hàng của bạn
        </h1>

        {cart && cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center bg-gray-800 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={item.productId.thumbnail}
                      alt={item.productId.title}
                      className="w-24 h-24 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/api/api/cart-service/${item.productId._id}`}
                        className="text-lg font-semibold hover:text-blue-400 transition-colors"
                      >
                        {item.productId.title}
                      </Link>
                      <p className="text-sm text-gray-400 mt-1">
                        {item.productId.description.substring(0, 100)}...
                      </p>
                      <p className="text-lg font-bold text-blue-400 mt-2">
                        {(item.productId.discountedPrice).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-600 rounded-full bg-gray-700">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId._id,
                              Math.max(item.quantity - 1, 1)
                            )
                          }
                          className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                        >
                          <FaMinus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId._id,
                              Math.min(item.quantity + 1, 99)
                            )
                          }
                          className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                        >
                          <FaPlus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId._id)}
                        className="p-2 hover:bg-red-600 rounded-full transition-colors"
                      >
                        <FaTrash className="h-5 w-5 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Tổng kết đơn hàng */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">Tổng kết đơn hàng</h2>
              <div className="flex justify-between mb-4">
                <span>Tổng cộng:</span>
                <span className="font-bold text-blue-400">
                  {calculateTotal().toLocaleString("vi-VN")} VND
                </span>
              </div>
              <Link to="/checkout">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  Thanh toán
                </motion.button>
              </Link>
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

export default CartPage;