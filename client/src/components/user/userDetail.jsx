import { useState } from 'react';
import { FaEdit, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/authContext';
import apiClient from '../helper/axios';
import { useToast } from '../../context/toastContext';

const UserDetail = () => {
  const {user} = useAuth();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Fake PUT API call
     const res= await apiClient.put(`/api/user-service/${user._id}`, form);
     console.log("res:::", res.data?.data.success, res.data.success);
     if(res.data.success){
      showToast(res?.data.message);
     }
    } catch (err) {
      showToast(err?.data.message || "Có lỗi xảy ra khi cập nhật" , "error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp.', "error");
      return;
    }

    if (newPassword === oldPassword) {
      showToast('Mật khẩu mới không được trùng với mật khẩu mới.', "error");
      return;
    }

    try {
      // Fake API call
      const res= await apiClient.post(`/api/user-service/change-password`, {
        email : form.email,
        newPassword 
      });
     console.log("res:::", res.data?.data.success, res.data.success);
     if(res.data.success){
      showToast(res?.data.message);
     }
    } catch (err) {
      showToast(err?.data.message || 'Đổi mật khẩu thất bại', 'error');
    }finally{
      setShowPasswordModal(false);
    }
  };

  console.log("form::", form);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Chi tiết người dùng</h2>
      <div className="flex flex-row gap-8">
        <div className="flex-shrink-0">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-40 h-40 rounded-full object-cover border shadow"
          />
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <label className="flex flex-col">
            <span className="font-medium">Tên người dùng</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />
          </label>

          <label className="flex flex-col">
            <span className="font-medium">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />
          </label>

          <label className="flex flex-col">
            <span className="font-medium">Số điện thoại</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md"
            />
          </label>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <FaEdit className="inline-block mr-2" />Lưu thay đổi
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              <FaLock className="inline-block mr-2" />Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Đổi mật khẩu</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                name="oldPassword"
                placeholder="Mật khẩu cũ"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="Mật khẩu mới"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserDetail;
