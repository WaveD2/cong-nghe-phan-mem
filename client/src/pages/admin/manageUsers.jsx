// ManageUsers.tsx
import   { useState, useEffect, useCallback } from "react";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";
import "react-toastify/dist/ReactToastify.css";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timerId, setTimerId] = useState(null);

  const [adminUsers, setAdminUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { getAdminAllUsers, adminDeleteUser } = useAuth(); 
  // Assume adminDeleteUser:id:string => Promise<boolean>

  const LIMIT = 10;

  // Fetch users (with pagination info) from server
  const fetchUsers = useCallback(
    async (currentPage) => {
      setIsLoading(true);
      try {
        const res = await getAdminAllUsers({ page: currentPage, limit: LIMIT }); 
        console.log("Get all users", res);
        
        // res shape: { data: User[], pagination: { page, totalPages } }
        if (res.success) {
          setAdminUsers(res.data);
          setPagination({
            page: res.pagination.page,
            totalPages: res.pagination.totalPages,
          });
        } else {
          toast.error("Không thể tải danh sách người dùng.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    },
    [getAdminAllUsers]
  );

  // Initial fetch and when page changes
  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  // Debounce search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (timerId) clearTimeout(timerId);
    const id = setTimeout(() => setDebouncedSearch(value), 500);
    setTimerId(id);
  };

  // Filter users client-side based on debouncedSearch
  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setFilteredUsers(adminUsers);
    } else {
      const lower = debouncedSearch.toLowerCase();
      setFilteredUsers(
        adminUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower) ||
            u.role.toLowerCase().includes(lower)
        )
      );
    }
  }, [debouncedSearch, adminUsers]);

  const handleView = (id) => {
    navigate(`/dashboard/admin/users/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/admin/users/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn xóa người dùng này?")) return;
    try {
      setIsLoading(true);
      const success = await adminDeleteUser(id);
      if (success) {
        toast.success("Xóa người dùng thành công!");
        // Nếu hiện tại chỉ có 1 user trên trang và không phải trang 1, lùi trang
        if (filteredUsers.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchUsers(page);
        }
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xóa người dùng thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Quản lý Người dùng</h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Avatar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={user.avatar || "/admin/default_avatar.png"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                      <button
                        onClick={() => handleView(user._id)}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(user._id)}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              &larr; Trước
            </button>
            <span className="text-gray-700">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Tiếp &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
