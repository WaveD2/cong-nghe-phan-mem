import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCreditCard, FaMoneyBillWave, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "../helper/axios";
import { useToast } from "../../context/toastContext";

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [formData, setFormData] = useState({
    street: "", // DistrictName (quận/huyện)
    city: "", // ProvinceName (tỉnh/thành)
    state: "", // WardName (phường/xã)
    detail: "",
    paymentMethod: "cod",
    provinceId: "",
    districtId: "",
  });
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Lấy danh sách tỉnh/thành
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
          headers: {
            "Content-Type": "application/json",
            token: "0a17e2f8-4d98-11ef-a436-e614db896277",
          },
        });
        if (response.data.code === 200) {
          setProvinces(response.data.data.sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName)));
        } else {
          showToast("Không thể tải danh sách tỉnh/thành", "error");
        }
      } catch (error) {
        showToast("Lỗi khi tải danh sách tỉnh/thành", "error");
      }
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách quận/huyện
  useEffect(() => {
    if (formData.provinceId) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
            headers: {
              "Content-Type": "application/json",
              token: "0a17e2f8-4d98-11ef-a436-e614db896277",
            },
          });
          if (response.data.code === 200) {
            const filteredDistricts = response.data.data
              .filter((district) => district.ProvinceID === parseInt(formData.provinceId))
              .sort((a, b) => a.DistrictName.localeCompare(b.DistrictName));
            setDistricts(filteredDistricts);
            setFormData((prev) => ({
              ...prev,
              street: "",
              districtId: "",
              state: "",
            }));
            setWards([]);
          } else {
            showToast("Không thể tải danh sách quận/huyện", "error");
          }
        } catch (error) {
          showToast("Lỗi khi tải danh sách quận/huyện", "error");
        }
      };
      fetchDistricts();
    }
  }, [formData.provinceId]);

  // Lấy danh sách xã/phường
  useEffect(() => {
    if (formData.districtId) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(
            `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${formData.districtId}`,
            {
              headers: {
                "Content-Type": "application/json",
                token: "0a17e2f8-4d98-11ef-a436-e614db896277",
              },
            }
          );
          if (response.data.code === 200 && response.data.data) {
            setWards(response.data.data.sort((a, b) => a.WardName.localeCompare(b.WardName)));
            setFormData((prev) => ({ ...prev, state: "" }));
          } else {
            showToast("Không thể tải danh sách xã/phường", "error");
          }
        } catch (error) {
          showToast("Lỗi khi tải danh sách xã/phường", "error");
        }
      };
      fetchWards();
    }
  }, [formData.districtId]);

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
    if (name === "provinceId") {
      const selectedProvince = provinces.find((p) => p.ProvinceID === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        provinceId: value,
        city: selectedProvince ? selectedProvince.ProvinceName : "",
        districtId: "",
        street: "",
        state: "",
      }));
    } else if (name === "districtId") {
      const selectedDistrict = districts.find((d) => d.DistrictID === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        districtId: value,
        street: selectedDistrict ? selectedDistrict.DistrictName : "",
        state: "",
      }));
    } else if (name === "state") {
      const selectedWard = wards.find((w) => w.WardCode === value);
      setFormData((prev) => ({
        ...prev,
        state: selectedWard ? selectedWard.WardName : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Xử lý tạo đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        detail: formData.detail,
        paymentMethod: formData.paymentMethod,
      };
      const response = await apiClient.post("/api/order-service", payload);
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
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
      className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Thanh Toán
        </h1>

        {cart && cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form thông tin giao hàng */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50"
            >
              <h2 className="text-2xl font-semibold mb-6 text-blue-300">Thông Tin Giao Hàng</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Tỉnh/Thành</label>
                  <select
                    name="provinceId"
                    value={formData.provinceId}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="" disabled>Chọn tỉnh/thành</option>
                    {provinces.map((province) => (
                      <option key={province.ProvinceID} value={province.ProvinceID}>
                        {province.ProvinceName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Quận/Huyện</label>
                  <select
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                    disabled={!formData.provinceId}
                  >
                    <option value="" disabled>Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.DistrictID} value={district.DistrictID}>
                        {district.DistrictName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Xã/Phường</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                    disabled={!formData.districtId}
                  >
                    <option value="" disabled>Chọn xã/phường</option>
                    {wards.map((ward) => (
                      <option key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Địa chỉ chi tiết</label>
                  <textarea
                    name="detail"
                    value={formData.detail}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
                    rows={4}
                    placeholder="Nhập số nhà, tên đường, tòa nhà, v.v."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">Phương thức thanh toán</label>
                  <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 focus:ring-blue-500 border-gray-600/50 bg-gray-700/50"
                      />
                      <span className="flex items-center text-gray-200">
                        <FaMoneyBillWave className="mr-2 text-green-400" /> Thanh toán khi nhận hàng
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 focus:ring-blue-500 border-gray-600/50 bg-gray-700/50"
                      />
                      <span className="flex items-center text-gray-200">
                        <FaCreditCard className="mr-2 text-blue-400" /> Thẻ tín dụng
                      </span>
                    </label>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.street || !formData.city || !formData.state}
                >
                  Đặt Hàng
                </motion.button>
              </form>
            </motion.div>

            {/* Tổng kết đơn hàng */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 sticky top-4"
            >
              <h2 className="text-2xl font-semibold mb-6 text-blue-300">Tổng Kết Đơn Hàng</h2>
              <AnimatePresence>
                {cart.items?.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between mb-4 text-gray-200"
                  >
                    <span className="text-sm truncate max-w-[60%]">{item.productId.title} (x{item.quantity})</span>
                    <span className="text-sm font-medium">
                      {(item.productId.discountedPrice * item.quantity).toLocaleString("vi-VN")} VND
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-600/50">
                <span className="font-semibold text-lg text-gray-200">Tổng cộng:</span>
                <span className="font-bold text-xl text-blue-400">
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
            <FaShoppingCart className="mxIMPORTS
            mx-auto h-16 w-16 text-gray-400" />
            <p className="text-xl mt-4 text-gray-200">Giỏ hàng của bạn đang trống</p>
            <Link to="/store">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Tiếp Tục Mua Sắm
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CheckoutPage;