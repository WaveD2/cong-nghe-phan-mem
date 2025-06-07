import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { CustomTable } from "../../components/helper/table.v2.jsx";
import ConfirmationPopup from "../../components/helper/popup.jsx";
import { X, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/authContext.jsx";
import ImageUpload from "../../components/helper/image.jsx";

export default function ManageUsers() {
  const { isLoading, adminUserUpdate, adminUserDelete, searchAndFilterUsers, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [avatar, setAvatar] = useState([]);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    avatar: "",
    phone: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetching(true);
      try {
        const params = {
          search: searchParams.get("search") || "",
          filter: searchParams.get("role") || "",
          page: parseInt(searchParams.get("page")) || 1,
          limit: parseInt(searchParams.get("limit")) || 10,
        };
        const response = await searchAndFilterUsers(params.search, params.filter, params.page, params.limit);
        setUsers(response.data || []);
        setPagination({
          page: response.pagination.page || 1,
          totalPages: response.pagination.totalPages || 1,
          total: response.pagination.total || 0,
          limit: response.pagination.limit || 10,
        });
      } catch (error) {
        toast.error("Không thể tải danh sách người dùng");
        console.error("Fetch users error:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchUsers();
  }, [searchParams]);

  // Handle page change
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

  // Handle limit change
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

  // Handle user deletion
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const record = await adminUserDelete(selectedUser._id);
      console.log("record:::", record);
      
      if(record.success){
        toast.success(record.message);
        const response = await searchAndFilterUsers();
        setUsers(response.data || []);
        setPagination({
          page: response.pagination.page || 1,
          totalPages: response.pagination.totalPages || 1,
          total: response.pagination.total || 0,
          limit: response.pagination.limit || 10,
        });
      }
    } catch (error) {
      toast.error(error.response.data.message || "Lỗi xóa người dùng");
      console.error("Delete user error:", error);
    } finally {
      setSelectedUser(null);
      setIsOpenModal(false);
    }
  };

  // Handle form input change
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate create form
  const validateForm = () => {
    const errors = {};
    if (!createFormData.name.trim()) errors.name = "Tên là bắt buộc";
    if (!createFormData.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(createFormData.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!createFormData.password.trim()) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (createFormData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!createFormData.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^\d{10,11}$/.test(createFormData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
    return errors;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      
      const response = await register(
        {
          name: createFormData.name,
          email: createFormData.email,
          password: createFormData.password,
          role: createFormData.role,
          phone: createFormData.phone,
          avatar: avatar[0],
          isActive: createFormData.isActive
        }
      );
      if (response.data.success) {
        toast.success("Tạo người dùng thành công");
        const response = await searchAndFilterUsers();
        setUsers(response.data || []);
        setPagination({
          page: response.pagination.page || 1,
          totalPages: response.pagination.totalPages || 1,
          total: response.pagination.total || 0,
          limit: response.pagination.limit || 10,
        });
        setCreateFormData({
          name: "",
          email: "",
          password: "",
          role: "user",
          avatar: "",
          phone: "",
        });
        setIsOpenCreateModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo người dùng");
      console.error("Create user error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        header: "Tên",
        accessorKey: "name",
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedUser(row)}
            className="text-blue-600 hover:underline font-medium"
          >
            {row?.name}
          </button>
        ),
      },
      {
        header: "Avatar",
        accessorKey: "avatar",
        cell: ({ row }) => (
          <img
            src={row?.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Quyền",
        accessorKey: "role",
      },
      {
        header: "Số điện thoại",
        accessorKey: "phone",
      },
      {
        header: "Trạng thái",
        accessorKey: "isActive",
        cell: ({ getValue }) => (
          <span className={`text-${getValue() ? "green" : "red"}-500`}>
            {getValue() ? "Hoạt động" : "Không hoạt động"}
          </span>
        ),
      },
      {
        header: "",
        accessorKey: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/dashboard/users/${row?._id}`)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="Chỉnh sửa người dùng"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => {
                setSelectedUser(row);
                setIsOpenModal(true);
              }}
              className="text-red-500 hover:text-red-700 transition"
              title="Xóa người dùng"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [navigate, setSearchParams]
  );

  return (
    <motion.div
      className="container mx-auto p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
        <button
          onClick={() => setIsOpenCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          <FiPlus className="mr-2" /> Tạo người dùng
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <CustomTable
          columns={columns}
          data={users}
          pagination={pagination}
          onPageChange={handlePageChange}
          onChangeLimit={handleLimitChange}
          loading={isLoading || isFetching}
          limit={pagination.limit}
        />
      </div>

      <AnimatePresence>
        {selectedUser && !isOpenModal && (
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
                <h3 className="text-2xl font-bold text-gray-900">Thông tin người dùng</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Tên</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {selectedUser.name}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Quyền</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {selectedUser.role}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Trạng thái</label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {selectedUser.isActive ? "Hoạt động" : "Không hoạt động"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Avatar</label>
                    <img
                      src={selectedUser?.avatar}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover mt-2 shadow-sm"
                   
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-8 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/dashboard/users/${selectedUser._id}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                  >
                    Chỉnh sửa
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedUser(null)}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                  >
                    Đóng
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpenCreateModal && (
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
                <h3 className="text-2xl font-bold text-gray-900">Tạo người dùng mới</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsOpenCreateModal(false);
                    setCreateFormData({
                      name: "",
                      email: "",
                      password: "",
                      role: "user",
                      avatar: "",
                      phone: "",
                      isActive: true
                    });
                    setFormErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Tên *</label>
                    <input
                      type="text"
                      name="name"
                      value={createFormData.name}
                      onChange={handleCreateFormChange}
                      className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        formErrors.name ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Nhập tên"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={createFormData.email}
                      onChange={handleCreateFormChange}
                      className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        formErrors.email ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Nhập email"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Mật khẩu *</label>
                    <input
                      type="password"
                      name="password"
                      value={createFormData.password}
                      onChange={handleCreateFormChange}
                      className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        formErrors.password ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Nhập mật khẩu"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      name="phone"
                      value={createFormData.phone}
                      onChange={handleCreateFormChange}
                      className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        formErrors.phone ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Quyền *</label>
                    <select
                      name="role"
                      value={createFormData.role}
                      onChange={handleCreateFormChange}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="isActive" className="text-sm font-semibold text-gray-600 mb-1">
                      Trạng thái *
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleCreateFormChange({
                            target: { name: "isActive", value: !createFormData.isActive },
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                          createFormData.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            createFormData.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-600">
                        {createFormData.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Avatar URL</label>
                    <ImageUpload maxImages={1} singleImage={true} setImages={setAvatar}/> 
                  </div>
                </div>
                <div className="flex justify-end mt-8 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsOpenCreateModal(false);
                      setCreateFormData({
                        name: "",
                        email: "",
                        password: "",
                        role: "user",
                        avatar: "",
                        phone: "",
                      });
                      setFormErrors({});
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Tạo"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationPopup
        isOpen={isOpenModal}
        onCancel={() => {
          setSelectedUser(null);
          setIsOpenModal(false);
        }}
        content={`Bạn có chắc chắn xóa người dùng ${selectedUser?.name}?`}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
}