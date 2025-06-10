import { motion } from "framer-motion";
import { FaTrash, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { IOrder } from "../types/interface/IOrder";
import { useAuth } from "../context/AuthContext";
import { cancelOrder, deleteOrder } from "../utils/api";
const OrderItem = ({ order, onUpdate }) => {

  const handleCancel = async () => {
    try {
      await cancelOrder(order._id);
      onUpdate();
    } catch (error: any) {
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(order._id, token);
      onUpdate();
    } catch (error: any) {
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 p-4 rounded-lg shadow-md text-white mb-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mã đơn hàng: {order._id}</h3>
        <span className={`text-sm ${order.status === "pending" ? "text-yellow-400" : order.status === "cancelled" ? "text-red-400" : "text-green-400"}`}>
          {order.status.toUpperCase()}
        </span>
      </div>
      <p className="text-sm mt-2">Ngày đặt: {new Date(order.orderDate).toLocaleDateString()}</p>
      <p className="text-sm">Tổng tiền: {order.totalAmount.toLocaleString()} VNĐ</p>
      <p className="text-sm">Địa chỉ: {`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`}</p>
      <p className="text-sm">Phương thức thanh toán: {order.paymentMethod}</p>
      <div className="mt-2">
        <h4 className="text-sm font-medium">Sản phẩm:</h4>
        <ul className="list-disc pl-5">
          {order.items.map((item, index) => (
            <li key={index} className="text-sm">
              {item.name} - Số lượng: {item.quantity} - Giá: {item.price.toLocaleString()} VNĐ
            </li>
          ))}
        </ul>
      </div>
      {order.status === "pending" && (
        <div className="flex space-x-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="bg-red-600 text-white py-1 px-3 rounded-md flex items-center"
          >
            <FaTimesCircle className="mr-1" /> Hủy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="bg-gray-600 text-white py-1 px-3 rounded-md flex items-center"
          >
            <FaTrash className="mr-1" /> Xóa
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default OrderItem;