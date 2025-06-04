import  { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";

import { useProducts} from "../../context/productContext";
import {CustomTable} from "../../components/helper/table.v2.jsx"
import  ImageUpload from "../../components/helper/image.jsx"
import { CATEGORIES } from "../../constant.js";
import { formatCurrencyVND } from "../../hepler.js";

const defaultForm = {
  _id: "",
  title: "",
  description: "",
  category: "",
  price: 0,
  discount: 0,
   stock: 0,
  tags: "",
  brand: "",
  sku: "",
  thumbnail: "",
  images: "",
};

const DEBOUNCE_DELAY = 300;

const ManageProducts = () => {
  const {
    products,
    filters,
    resetFilters,
    loading,
    adminProductDelete,
    adminProductUpdate,
    adminCreateProduct,
  } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [images, setImages] = useState([]);
  const [imageDetail, setImageDetail] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(false); // chỉnh sửa or edit


  const pagination = products?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  };

  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    if (Object.keys(params).length > 0) {
      // Update filters based on URL params
      const newFilters = { ...filters };
      if (params.title) newFilters.title = params.title;
      if (params.category) newFilters.category = params.category;
      if (params.price) newFilters.price = params.price;
      if (params.stock) newFilters.stock = params.stock;
      if (params.brand) newFilters.brand = params.brand;
      if (params.page) pagination.page = Number(params.page);
      if (params.limit) pagination.limit = Number(params.limit);
      // Trigger filter update (assuming useProducts handles filter updates)
      handleColumnFilter(newFilters);
    }
  }, []);

  const createProductModal = () =>{
      setFormData(defaultForm);
      setIsModalOpen(true);
      setEditProduct(false);
  }

  const openViewModal = ((product) => {
    setEditProduct(true);
    setFormData(product);
    setIsModalOpen(true);
  });

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData(defaultForm);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "discount", "stock"].includes(name)
        ? Number(value) || 0
        : value,
    }));
  }, []);

  // Handle product deletion
  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        setLocalLoading(true);
        try {
          await adminProductDelete(id);
        } catch (error) {
          console.log("error::", error);
        } finally {
          setLocalLoading(false);
        }
      }
    },
    [adminProductDelete]
  );

  // Handle form submission for add/edit
  const handleSubmit = 
    async (e) => {
      e.preventDefault();
      setLocalLoading(true);
      try {
        const data = {
          ...formData,
          tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
          images: images,
          thumbnail: imageDetail[0],
        };
        
        console.log("data:::", data );
        
        // if (isEditing) {
        //   await adminProductUpdate(formData._id, data);
        // } else {
        //   await adminCreateProduct(data);
        // }
        closeModal();
      } catch (error) {
        console.log("error::", error);
      } finally {
        setLocalLoading(false);
      }
    };

  // Handle pagination page change
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
        newParams.set("page", 1); // Reset to page 1 when limit changes
        return newParams;
      });
    },
    [setSearchParams]
  );

  // Handle column filter changes
  const handleColumnFilter = useCallback(
    (newFilters) => {
      if(newFilters){
        setSearchParams(() => {
          const newParams = new URLSearchParams();
          Object.entries(newFilters).forEach(([key, value]) => {
            if (value) newParams.set(key, value);
          });
          newParams.set("page", pagination.page);
          newParams.set("limit", pagination.limit);
          return newParams;
        });
      }
    },
    [pagination.page, pagination.limit, setSearchParams]
  );

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        header: "Tên sản phẩm",
        accessorKey: "title",
        filterFn: (row, value) =>
          row.original.title.toLowerCase().includes(value.toLowerCase()),
        filterComponent: ({ value, onChange }) => (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm tên..."
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md 
            focus:outline-none focus:ring focus:ring-blue-300"
          />
        ),
        cell: ({ row }) => (
          <button
            onClick={() => openViewModal(row)}
            className="text-blue-600 hover:underline"
          >
            {row.title}
          </button>
        ),
      },
      {
        header: "Loại",
        accessorKey: "category",
        filterFn: (row, value) => !value || row.original.category === value,
        filterComponent: ({ value, onChange }) => (
          <Select
            options={CATEGORIES}
            value={CATEGORIES.find((opt) => opt.value === value) || null}
            onChange={(opt) => onChange(opt ? opt.value : "")}
            isClearable
            placeholder="Chọn loại..."
            className="text-sm w-max"
          />
        ),
        cell: ({ getValue }) => {
          const item = CATEGORIES.find((opt) => opt.value === getValue());
          const colorClass = item?.color || "bg-gray-100 text-gray-800";
          return (
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${colorClass} text-center`}
            >
              {item?.label || getValue()}
            </span>
          );
        },
      },
      {
        header: "Giá tiền",
        accessorKey: "price",
        filterFn: (row, value) => {
          const [min, max] = value
            ? value.split("-").map(Number)
            : [0, Infinity];
          return (
            row.original?.price >= (min || 0) &&
            (!max || row.original?.price <= max)
          );
        },
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
          <span className="text-blue-500">
            {formatCurrencyVND(getValue())}
          </span>
        ),
      },
      {
        header: "Số lượng",
        accessorKey: "stock",
        filterFn: (row, value) =>
          !value || row.original.stock === Number(value),
        filterComponent: ({ value, onChange }) => (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Số lượng..."
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        ),
      },
      {
        header: "Thương hiệu",
        accessorKey: "brand",
        filterFn: (row, value) =>
          row.original.brand.toLowerCase().includes(value.toLowerCase()),
        filterComponent: ({ value, onChange }) => (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tìm thương hiệu..."
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        ),
      },
      {
        header: "",
        accessorKey: "actions",
        enableSorting: false,
        enableFiltering: false,
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openViewModal(row)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="Chỉnh sửa"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(row._id)}
              className="text-red-500 hover:text-red-700 transition"
              title="Xóa"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [ handleDelete]
  );
  
  console.log("formData::", formData);
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Quản lý sản phẩm</h2>
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        
        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={() => createProductModal()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus className="mr-2" /> Thêm sản phẩm
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <CustomTable
            columns={columns}
            data={products?.data || []}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            onChangeLimit={handleLimitChange}
            loading={loading || localLoading}
            onFilterChange={handleColumnFilter}
            filterDebounce={DEBOUNCE_DELAY}
            limit={pagination.limit}
            filtersValueDefault={filters}
          />
        </div>

        <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-60 md:px-0 px-2"
        >
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white md:w-1/2 w-full max-w-full h-full md:rounded-l-2xl rounded-none p-6 overflow-y-auto shadow-2xl"
          >
            {editProduct ? (
              // View Details Modal
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Chi tiết sản phẩm
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Tên sản phẩm</label>
                    <p className="text-base text-gray-900 font-medium">{formData.title}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Danh mục</label>
                    <p className="text-base text-gray-900 font-medium">
                      {CATEGORIES.find((opt) => opt.value === formData.category)?.label ||
                        formData.category}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Giá</label>
                    <p className="text-base text-gray-900 font-medium">
                      {formData.price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Giảm giá (%)</label>
                    <p className="text-base text-gray-900 font-medium">{formData.discount || 0}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Giá sau giảm</label>
                    <p className="text-base text-gray-900 font-medium">
                      {formData.discountedPrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Số lượng</label>
                    <p className="text-base text-gray-900 font-medium">{formData.stock}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Thương hiệu</label>
                    <p className="text-base text-gray-900 font-medium">{formData.brand}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">SKU</label>
                    <p className="text-base text-gray-900 font-medium">{formData.sku}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Tags</label>
                    <p className="text-base text-gray-900 font-medium">{formData.tags.join(', ')}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Thumbnail</label>
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail"
                      className="w-40 h-40 object-cover rounded-lg mt-2 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Hình ảnh</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {formData.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Mô tả</label>
                    <p className="text-base text-gray-900 font-medium">{formData.description}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                  >
                    Đóng
                  </motion.button>
                </div>
              </div>
            ) : (
              // Add/Edit Modal
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Tên sản phẩm</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="Nhập tên sản phẩm"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Danh mục</label>
                      <Select
                        options={CATEGORIES}
                        value={CATEGORIES.find((opt) => opt.value === formData.category) || null}
                        onChange={(opt) =>
                          setFormData((prev) => ({ ...prev, category: opt ? opt.value : '' }))
                        }
                        placeholder="Chọn danh mục..."
                        className="text-base"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: '0.5rem',
                            borderColor: '#e5e7eb',
                            backgroundColor: '#f9fafb',
                            padding: '0.25rem',
                            '&:hover': { borderColor: '#3b82f6' },
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          }),
                        }}
                        required
                      />
                    </div>

                    {/* Brand */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Thương hiệu</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleFormChange}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="Ví dụ: Samsung"
                        required
                      />
                    </div>

                    {/* SKU */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleFormChange}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="Ví dụ: SP12345"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Giá (VND)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        min={0}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="Ví dụ: 1000000"
                        required
                      />
                    </div>

                    {/* Discount */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Giảm giá (%)</label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleFormChange}
                        min={0}
                        max={100}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="0–100"
                      />
                    </div>

                    {/* Stock */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Số lượng</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleFormChange}
                        min={0}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="Số lượng tồn"
                        required
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-1">Tags (phân tách bởi ,)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleFormChange}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 transition-all duration-200"
                        placeholder="Ví dụ: new, hot, sale"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="flex flex-col col-span-2  w-full">
                      <label className="text-sm font-medium text-gray-600 mb-1">Ảnh</label>
                      <ImageUpload singleImage={true} maxImages={1} setImages={setImageDetail} imagesDefault={[formData.thumbnail]} />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-1">Mô tả</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={4}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50 resize-none transition-all duration-200"
                        placeholder="Mô tả sản phẩm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col col-span-2 w-full">
                      <label className="text-sm font-medium text-gray-600 mb-1">Ảnh biến thể</label>
                       <ImageUpload singleImage={false} maxImages={5} setImages={setImages} imagesDefault={formData.images}/>
                    </div>

                  {/* Form Buttons */}
                  <div className="flex justify-end space-x-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={localLoading}
                    >
                      Hủy
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={localLoading}
                    >
                      {localLoading && (
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-5 h-5 mr-2 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </motion.svg>
                      )}
                      {editProduct ? 'Cập nhật' : 'Tạo mới'}
                    </motion.button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageProducts;
