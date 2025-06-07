import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import LoadingComponent from "../../components/helper/loadingComponent";
import { useToast } from "../../context/toastContext";
import { Save, UploadCloud, X } from "lucide-react";
import { motion } from "framer-motion";
import ImageUpload from "../../components/helper/image";
import Select from "react-select";

const ROLES = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

function ManageUserIndividual() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdminUsersById, adminUserUpdate } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await getAdminUsersById(id);
        const userData = response.data;
        setUser({
          ...userData,
          isActive: userData.isActive !== undefined ? userData.isActive : true,  
        });
        setAvatarPreview(userData.avatar || "");
      } catch (error) {
        showToast("Không thể tải thông tin người dùng", "error");
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, getAdminUsersById, showToast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoleChange = (selectedOption) => {
    setUser((prev) => ({ ...prev, role: selectedOption.value }));
    setFormErrors((prev) => ({ ...prev, role: "" }));
  };

  // Handle isActive toggle
  const handleIsActiveToggle = () => {
    setUser((prev) => ({ ...prev, isActive: !prev.isActive }));
    setFormErrors((prev) => ({ ...prev, isActive: "" }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!user.name?.trim()) errors.name = "Tên là bắt buộc";
    if (!user.email?.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!user.role) errors.role = "Quyền là bắt buộc";
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: avatarPreview,
        isActive: user.isActive,
        phone: user.phone,
      };
      await adminUserUpdate(id, updatedUser);
      showToast("Cập nhật người dùng thành công", "success");
    } catch (error) { 
      showToast(error.response?.data?.message || "Không thể cập nhật người dùng", "error");
      console.error("Update user error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle avatar change
  const handleAvatarChange = (images) => {
    setAvatarPreview(images[0] || "");
    setFormErrors((prev) => ({ ...prev, avatar: "" }));
  };

  if (loading) return <LoadingComponent />;
  if (!user) return <div className="text-center text-gray-600 p-6">Không tìm thấy người dùng</div>;

  return (
    <motion.div
      className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Chỉnh sửa người dùng</h1>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/dashboard/users")}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
              Tên *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name || ""}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên"
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email || ""}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập email"
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={user.phone || ""}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="role" className="text-sm font-medium text-gray-700 mb-1">
              Quyền *
            </label>
            <Select
              id="role"
              options={ROLES}
              value={ROLES.find((opt) => opt.value === user.role) || ROLES[0]}
              onChange={handleRoleChange}
              className="w-full"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: formErrors.role ? "#ef4444" : "#d1d5db",
                  "&:hover": { borderColor: formErrors.role ? "#ef4444" : "#93c5fd" },
                  boxShadow: "none",
                }),
              }}
            />
            {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 mb-1">
              Trạng thái *
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleIsActiveToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  user.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    user.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-600">
                {user.isActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Avatar</label>
            <div className="flex items-center gap-4 mt-2">
              <UploadCloud className="w-6 h-6 text-blue-400" />
              <ImageUpload
                maxImages={1}
                imagesDefault={[avatarPreview]}
                setImages={handleAvatarChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-md font-medium transition-all duration-200 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
            }`}
          >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? "Đang cập nhật..." : "Cập nhật"}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default ManageUserIndividual;