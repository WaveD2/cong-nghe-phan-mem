import  { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Select from "react-select";
import { motion } from "framer-motion";
import { useProducts} from "../../context/productContext";
import {CustomTable} from "../../components/helper/table.v2.jsx"
import { CATEGORIES } from "../../constant.js";
import { formatCurrencyVND } from "../../hepler.js";

const DEBOUNCE_DELAY = 300;

const ManageProducts = () => {
  const {
    products,
    filters,
    resetFilters,
    loading,
    adminProductDelete,
  } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

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
            onClick={() => {
              navigate(`/dashboard/products/${row.original._id}`);
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
              onClick={() => navigate(`/dashboard/products/${row._id}`)}
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
  
  
  return (
    <motion.div
    className="container mx-auto p-6 bg-white shadow-lg rounded-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Quản lý sản phẩm</h2>
      <div className="mx-auto p-6">
        
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

        <div className="overflow-x-auto w-full">
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
      </div>
    </motion.div>
  );
};

export default ManageProducts;
