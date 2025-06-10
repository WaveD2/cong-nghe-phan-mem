import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiTrash2, FiEye } from "react-icons/fi";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";
import apiClient from "../../components/helper/axios";
import { useToast } from "../../context/toastContext";
import ConfirmationPopup from "../../components/helper/popup.jsx";
import { X } from "lucide-react";
import { CustomTable } from "../../components/helper/table.v2.jsx";

const ORDER_STATUSES = [
  { value: "pending", label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800" },
  { value: "shipped", label: "Đang giao", color: "bg-blue-100 text-blue-800" },
  { value: "delivered", label: "Đã giao", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Hoàn thành", color: "bg-purple-100 text-purple-800" },
];

const DEBOUNCE_DELAY = 500;

const formatCurrencyVND = (amount) => {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const ManageOrders = () => {
  const [orders, setOrders] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 10 } });
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [orderActive, setOrderActive] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const pagination = orders?.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 };

  // Lấy danh sách đơn hàng
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await apiClient.get("/api/order-service", { params });
      setOrders(response.data);
    } catch (error) {
      showToast("Không thể tải danh sách đơn hàng" | error.response.data.message, "error");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await apiClient.put(`/api/order-service/${orderId}`, { status });
      setOrders((prev) => ({
        ...prev,
        data: prev.data.map((order) =>
          order._id === orderId ? { ...order, status: response.data.data.status } : order
        ),
      }));
      showToast("Cập nhật trạng thái đơn hàng thành công", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  // Xóa đơn hàng
  const handleDelete = async () => {
    try {
      await apiClient.delete(`/api/order-service/${orderActive._id}`);
      setOrders((prev) => ({
        ...prev,
        data: prev.data.filter((order) => order._id !== orderActive._id),
        pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
      }));
      showToast("Xóa đơn hàng thành công", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Lỗi xóa đơn hàng", "error");
    } finally {
      setOrderActive(null);
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = useCallback(
    (newPage) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", newPage);
        return newParams;
      });
    },
    [setSearchParams]
  );

  // Xử lý thay đổi giới hạn
  const handleLimitChange = useCallback(
    (newLimit) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("limit", newLimit);
        newParams.set("page", 1);
        return newParams;
      });
    },
    [setSearchParams]
  );

  // Xử lý bộ lọc
  const handleColumnFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setSearchParams(() => {
        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value) newParams.set(key, value);
        });
        newParams.set("page", pagination.page);
        newParams.set("limit", pagination.limit);
        return newParams;
      });
    },
    [pagination.page, pagination.limit, setSearchParams]
  );

  // Định nghĩa cột bảng
  const columns = useMemo(
    () => [
      {
        header: "Mã đơn hàng",
        accessorKey: "_id",
        filterComponent: ({ value, onChange }) => (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm mã..."
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        ),
        cell: ({ getValue }) => (
          <button
            onClick={() => {
              const order = orders.data.find((o) => o._id === getValue());
              setOrderDetail(order);
            }}
            className="text-blue-600 hover:underline"
          >
            {getValue().slice(-6)}
          </button>
        ),
      },
      {
        header: "Khách hàng",
        accessorKey: "userId",
        filterComponent: ({ value, onChange }) => (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm khách hàng..."
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        ),
        cell: ({ getValue }) => getValue()?.name || getValue()?._id || "Khách vãng lai",
      },
      {
        header: "Tổng tiền",
        accessorKey: "totalAmount",
        filterComponent: ({ value, onChange }) => {
          const [min, max] = value ? value.split("-") : ["", ""];
          return (
            <div className="flex gap-1">
              <input
                type="number"
                value={min}
                onChange={(e) => onChange(`${e.target.value || ""}-${max}`)}
                placeholder="Min"
                className="w-[120px] px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
              <input
                type="number"
                value={max}
                onChange={(e) => onChange(`${min}-${e.target.value || ""}`)}
                placeholder="Max"
                className="w-[120px] px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          );
        },
        cell: ({ getValue }) => (
          <span className="text-blue-500">{formatCurrencyVND(getValue())}</span>
        ),
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        filterComponent: ({ value, onChange }) => (
          <Select
            options={ORDER_STATUSES}
            value={ORDER_STATUSES.find((opt) => opt.value === value) || null}
            onChange={(opt) => onChange(opt ? opt.value : "")}
            isClearable
            placeholder="Chọn trạng thái..."
            className="text-sm w-max"
          />
        ),
        cell: ({ getValue, row }) => {
          const status = getValue();
          const item = ORDER_STATUSES.find((opt) => opt.value === status);
          return (
            <Select
              options={ORDER_STATUSES}
              value={item}
              onChange={(opt) => opt && handleUpdateStatus(row._id, opt.value)}
              className="text-sm w-32"
              isSearchable={false}
            />
          );
        },
      },
      {
        header: "Ngày đặt",
        accessorKey: "orderDate",
        filterComponent: ({ value, onChange }) => (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        ),
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString("vi-VN"),
      },
      {
        header: "Phương thức thanh toán",
        accessorKey: "paymentMethod",
        filterComponent: ({ value, onChange }) => (
          <Select
            options={[
              { value: "cod", label: "Thanh toán khi nhận hàng" },
              { value: "card", label: "Thẻ tín dụng" },
            ]}
            value={value ? { value, label: value === "cod" ? "Thanh toán khi nhận hàng" : "Thẻ tín dụng" } : null}
            onChange={(opt) => onChange(opt ? opt.value : "")}
            isClearable
            placeholder="Chọn phương thức..."
            className="text-sm w-max"
          />
        ),
        cell: ({ getValue }) => (getValue() === "cod" ? "Thanh toán khi nhận hàng" : "Thẻ tín dụng"),
      },
      {
        header: "",
        accessorKey: "actions",
        enableSorting: false,
        enableFiltering: false,
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/dashboard/orders/${row._id}`)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="Xem chi tiết"
            >
              <FiEye size={18} />
            </button>
            <button
              onClick={() => setOrderActive(row)}
              className="text-red-500 hover:text-red-700 transition"
              title="Xóa"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <motion.div
      className="container mx-auto p-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Quản lý đơn hàng</h2>
      <div className="mx-auto bg-white shadow-lg rounded-lg p-3">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setFilters({});
              setSearchParams({});
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="w-full">
          <CustomTable
            columns={columns}
            data={orders?.data || []}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            onChangeLimit={handleLimitChange}
            loading={loading}
            onFilterChange={handleColumnFilter}
            filterDebounce={DEBOUNCE_DELAY}
            limit={pagination.limit}
            filtersValueDefault={filters}
          />
        </div>
      </div>

      <AnimatePresence>
        {orderDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 sm:px-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOrderDetail(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Mã đơn hàng</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{orderDetail._id}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Khách hàng</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{orderDetail.userId?.name || orderDetail.userId?._id || "Khách vãng lai"}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Tổng tiền</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{formatCurrencyVND(orderDetail.totalAmount)}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Trạng thái</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{ORDER_STATUSES.find((opt) => opt.value === orderDetail.status)?.label || orderDetail.status}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Ngày đặt</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{new Date(orderDetail.orderDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Phương thức thanh toán</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{orderDetail.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Thẻ tín dụng"}</p>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Địa chỉ giao hàng</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{orderDetail.shippingAddress.street}, {orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state} {orderDetail.shippingAddress.detail ? `(${orderDetail.shippingAddress.detail})` : ""}</p>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Sản phẩm</label>
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                      {orderDetail.items.map((item) => (
                        <div key={item._id} className="flex justify-between text-sm">
                          <span>{item.name} (x{item.quantity})</span>
                          <span>{formatCurrencyVND(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOrderDetail(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                  >
                    Đóng
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationPopup
        isOpen={orderActive}
        onCancel={() => setOrderActive(null)}
        content={`Bạn có chắc chắn xóa đơn hàng ${orderActive?._id.slice(-6)}?`}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
};

export default ManageOrders;