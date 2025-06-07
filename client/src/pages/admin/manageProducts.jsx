import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";
import { useProducts } from "../../context/productContext";
import { CustomTable } from "../../components/helper/table.v2.jsx";
import { CATEGORIES , DEBOUNCE_DELAY} from "../../constant.js";
import { formatCurrencyVND } from "../../hepler.js";
import ConfirmationPopup from "../../components/helper/popup.jsx";
import { X } from "lucide-react";

const ManageProducts = () => {
  const { products, filters, resetFilters, loading, adminProductDelete } =
    useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [productActive, setProductActive] = useState();
  const [formData, setFormData] = useState();

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

  // Handle product deletion
  const handleDelete = async () => {
    console.log("productActive::", productActive);

    try {
      await adminProductDelete(productActive._id);
    } catch (error) {
      console.log("error", error);
    } finally {
      setProductActive(null);
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
      if (newFilters) {
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
            onClick={() => {
              setFormData(row);
            }}
            className="text-blue-600 hover:underline"
          >
            {row.title}
          </button>
        ),
      },
      {
        header: "Loại",
        accessorKey: "category",
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
        header: "Số lượng",
        accessorKey: "stock",
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
              onClick={() => navigate(`/dashboard/products/${row._id}`)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="Chỉnh sửa"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => setProductActive(row)}
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
      className="container mx-auto p-3 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Quản lý sản phẩm
      </h2>
      <div className="mx-auto bg-white shadow-lg rounded-lg p-3 ">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={() => navigate("/dashboard/products/create")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus className="mr-2" /> Thêm sản phẩm
            </button>
          </div>
        </div>

        <div className="w-full">
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
            loading={loading}
            onFilterChange={handleColumnFilter}
            filterDebounce={DEBOUNCE_DELAY}
            limit={pagination.limit}
            filtersValueDefault={filters}
          />
        </div>
      </div>

      <AnimatePresence>
        {formData && (
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
                <h3 className="text-2xl font-bold text-gray-900">
                  Chi tiết sản phẩm
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Tên sản phẩm
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.title}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Danh mục
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {CATEGORIES.find((opt) => opt.value === formData.category)
                        ?.label || formData.category}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Giá
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Giảm giá (%)
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.discount || 0}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Giá sau giảm
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.discountedPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      S NUMBER lượng
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.stock}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Thương hiệu
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.brand}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      SKU
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.sku}
                    </p>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Tags
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.tags.join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Thumbnail
                    </label>
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail"
                      className="w-48 h-48 object-cover rounded-lg mt-2 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Hình ảnh
                    </label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {formData.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Hình ảnh ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 mb-1">
                      Mô tả
                    </label>
                    <p className="text-base text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                      {formData.description}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData(null)}
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
        isOpen={productActive}
        onCancel={() => setProductActive(null)}
        content={`Bạn có chắc chắn xóa sản phẩm ${productActive?.title}?`}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
};

export default ManageProducts;
