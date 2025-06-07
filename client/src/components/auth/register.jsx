import { useState } from "react";
import apiClient from "../helper/axios";
import LoadingComponent from "../helper/loadingComponent";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/toastContext";
import { useNavigate } from "react-router-dom";


const Register = () => {
    const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateRegistration = () => {
    let formErrors = {};
    if (!name) formErrors.name = "Vui lòng điền tên";
    if (!email) {
      formErrors.email = "Vui điền email";
    } else if (!emailRegex.test(email)) {
      formErrors.email = "Email sai định dạng";
    }
    if (!password) formErrors.password = "Vui lòng nhập mật khâu";
    if (!phone) formErrors.phone = "Vui lòng điền số diện thoại";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!validateRegistration()) return;

    setIsLoading(true);
    try {
      const res = await register(name, email, password, phone);

      console.log("Registration successful", res.data.success);
      if (res.data.success) {
        showToast(res.data.message, "success");
        navigate("/login");
        // getOtp(email);

      }
    } catch (err) {
      console.error("Error: ", err.response.data.errors.msg);
      //since its error contains array of objects
      err.response.data.errors.forEach((error) => {
        setErrors({ general: error.msg });
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) return <LoadingComponent />;

  return (
    <div className="min-h-screen  flex justify-center items-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl transform transition-all hover:scale-105">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Tạo Tài Khoản
        </h2>

        <form onSubmit={handleRegistration} noValidate>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="name"
            >
              Tên
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập email"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mật khâu"
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="phone"
            >
              Số điện thoại
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`mt-1 block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập số diện thoại"
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-sm text-red-500 text-center mb-4">
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Đang xử ly..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <span>
            Bạn đã có tài khoản ?
            <a href="/login" className="text-blue-600 hover:underline">
              {" "}
              Đăng nhập
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
