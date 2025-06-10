import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { debounce } from "../../hepler";
import LoadingComponent from "./loadingComponent";
import "./style.css";

export const CustomTable = ({ columns, data, pagination, onPageChange, onChangeLimit, onFilterChange, filterDebounce,
  loading, limit, filtersValueDefault
}) => {
    const [localFilters, setLocalFilters] = useState(
      columns.reduce((acc, col) => ({ ...acc, [col.accessorKey]: '' }), {})
    );
  
    const debouncedFilterChange = useCallback(
      debounce((key, value) => {
        onFilterChange({ ...localFilters, [key]: value });
      }, filterDebounce),
      [onFilterChange, filterDebounce]
    );
  
    const handleFilterChange = (key, value) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value }));
      debouncedFilterChange(key, value);
    };
  
    const filteredData = useMemo(() => {
      return data.filter((row) =>
        columns.every((col) => {
          if (!col.filterFn || !localFilters[col.accessorKey]) return true;
          return col.filterFn({ original: row }, localFilters[col.accessorKey]);
        })
      );
    }, [data, columns, localFilters]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="overflow-y-auto min-h-[500px] max-h-[500px] custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 border-collapse rounded-tr-md">
                {columns.map((col) => (
                  <th
                    key={col.accessorKey}
                    className="p-4 text-left text-sm font-semibold text-gray-800 sticky top-0 bg-gray-200 z-10"
                  >
                    <div className="flex flex-col">
                      <span>{col.header}</span>
                      {col.filterComponent && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2"
                        >
                          {col.filterComponent({
                            value: filtersValueDefault[col?.accessorKey] || localFilters[col.accessorKey],
                            onChange: (value) => handleFilterChange(col.accessorKey, value),
                          })}
                        </motion.div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="h-[200px]">
                    <LoadingComponent />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.accessorKey} className="p-4 text-sm text-gray-700">
                          {col.cell
                            ? col.cell({ getValue: () => row[col?.accessorKey], row })
                            : row[col?.accessorKey]}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-between mt-6"
          >
            <p className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Tổng <span className="font-semibold text-blue-500">{pagination.total}</span> 
              </p>
              <div className="flex items-center space-x-2">
                <select
                  id="limit"
                  value={limit || 10}
                  onChange={(e) => onChangeLimit(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                >
                  {[10, 15, 20, 50, 100].map((value) => (
                    <option key={value} value={value}>
                      {value} dòng
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
};