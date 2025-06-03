// ManageProducts.tsx
import  { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useProducts } from "../../context/productContext";
import "react-toastify/dist/ReactToastify.css";


const defaultForm = {
  title: "",
  description: "",
  category: "",
  price: 0,
  discount: 0,
  discountedPrice: 0,
  stock: 0,
  tags: "",
  brand: "",
  sku: "",
  thumbnail: "",
  images: "",
};

export default function ManageProducts() {
  const {
    adminProducts,         // { data: Product[], pagination: PaginationInfo }
    pagination,
    loading,
    getAdminAllProducts,   // (page: number, limit: number) => Promise<void>
    adminCreateProduct,    // (payload: Partial<Product>) => Promise<any>
    adminProductUpdate,    // (id: string, payload: Partial<Product>) => Promise<any>
    adminProductDelete,    // (id: string) => Promise<boolean>
  } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [localLoading, setLocalLoading] = useState(false);
  const [page, setPage] = useState(1);

  const LIMIT = 10; // Số sản phẩm mỗi trang

  // Lấy danh sách sản phẩm khi component mount hoặc page thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await getAdminAllProducts(page, LIMIT);
      } catch (err) {
        console.error("API Error:", err);
        toast.error("Không thể tải danh sách sản phẩm.");
      }
    };
    fetchProducts();
  }, [page, getAdminAllProducts]);

  // Mở modal để thêm mới
  const openCreateModal = () => {
    setFormData(defaultForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Mở modal để sửa, điền trước dữ liệu vào form
  const openEditModal = (product) => {
    setFormData({
      ...defaultForm,
      _id: product._id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      discount: product.discount,
      discountedPrice: product.discountedPrice,
      stock: product.stock,
      tags: product.tags.join(","),
      brand: product.brand,
      sku: product.sku,
      thumbnail: product.thumbnail,
      images: product.images.join(","),
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(defaultForm);
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["price", "discount", "discountedPrice", "stock"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit form tạo hoặc cập nhật sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      title,
      description,
      category,
      price,
      discount,
      discountedPrice,
      stock,
      tags,
      brand,
      sku,
      thumbnail,
      images,
      _id,
    } = formData

    // Validate
    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim() ||
      price < 0 ||
      discount < 0 ||
      discount > 100 ||
      discountedPrice < 0 ||
      discountedPrice > price ||
      stock < 0 ||
      !brand.trim() ||
      !sku.trim() ||
      !thumbnail.trim()
    ) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin hợp lệ. Giảm giá từ 0–100%, giá sau giảm ≤ giá gốc."
      );
      return;
    }

    // Chuẩn hóa payload
    const payload= {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      price,
      discount,
      discountedPrice,
      stock,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      brand: brand.trim(),
      sku: sku.trim(),
      thumbnail: thumbnail.trim(),
      images: images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img),
    };

    try {
      setLocalLoading(true);
      if (isEditing && _id) {
        const res = await adminProductUpdate(_id, payload);
        if (res) {
          toast.success("Cập nhật sản phẩm thành công!");
        }
      } else {
        const res = await adminCreateProduct(payload);
        if (res) {
          toast.success("Tạo sản phẩm thành công!");
        }
      }
      closeModal();
      // Refresh lại danh sách ở trang hiện tại
      await getAdminAllProducts(page, LIMIT);
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLocalLoading(false);
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        setLocalLoading(true);
        const success = await adminProductDelete(id);
        if (success) {
          toast.success("Xóa sản phẩm thành công!");
          // Nếu xóa hết sản phẩm trên trang này, chuyển về trang trước nếu có
          if (adminProducts.data.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            await getAdminAllProducts(page, LIMIT);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Xóa sản phẩm thất bại.");
      } finally {
        setLocalLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý Sản phẩm</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FiPlus className="mr-2" />
            Thêm sản phẩm
          </button>
        </header>

        <section className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Ảnh
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Giảm xong
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Thương hiệu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Số ảnh
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(loading || localLoading) && (
                <tr>
                  <td colSpan={13} className="px-4 py-6 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!loading && adminProducts?.data?.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-6 text-center text-gray-500">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              )}

              {!loading &&
                adminProducts?.data?.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{product.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.description.length > 60
                        ? product.description.slice(0, 57) + "..."
                        : product.description}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-gray-800 text-right">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-right">{product.discount}%</td>
                    <td className="px-4 py-3 text-gray-800 text-right">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.discountedPrice)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-right">{product.stock}</td>
                    <td className="px-4 py-3 text-gray-600">{product.brand}</td>
                    <td className="px-4 py-3 text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.tags.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-right">
                      {product.images.length}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 transition"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Phân trang */}
        {pagination && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              &larr; Trước
            </button>
            <span className="text-gray-700">
              Trang {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Tiếp &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa Sản phẩm */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-3xl mx-4 md:mx-0 shadow-lg overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? "Chỉnh sửa Sản phẩm" : "Thêm mới Sản phẩm"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <input
                      name="category"
                      type="text"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giảm giá (%)
                    </label>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => {
                        handleChange(e);
                        const disc = Number(e.target.value) || 0;
                        const newPrice = formData.price || 0;
                        const calculated = Math.round(newPrice * (1 - disc / 100));
                        setFormData((prev) => ({ ...prev, discountedPrice: calculated }));
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  {/* Discounted Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá sau giảm (VND)
                    </label>
                    <input
                      name="discountedPrice"
                      type="number"
                      min="0"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                    <input
                      name="brand"
                      type="text"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      name="sku"
                      type="text"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (ngăn cách bằng dấu phẩy)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  {/* Thumbnail URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ảnh đại diện (URL)
                    </label>
                    <input
                      name="thumbnail"
                      type="text"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Images URLs */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh sách ảnh (URL, ngăn cách bằng dấu phẩy)
                    </label>
                    <textarea
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-gray-700 transition"
                  disabled={localLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 ${
                    isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-md transition ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={localLoading}
                >
                  {isEditing ? (localLoading ? "Đang cập nhật..." : "Cập nhật") : localLoading ? "Đang tạo..." : "Tạo"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
