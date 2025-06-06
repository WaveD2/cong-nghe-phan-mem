import { useCallback, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { debounce } from "../../hepler";
import LoadingTable from "./loadingTable";
import LoadingComponent from "./loadingComponent";

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
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse min-h-36">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => (
                <th key={col.accessorKey} className="p-2 text-left text-sm font-medium text-gray-700">
                  <div className="flex flex-col">
                    <span>{col.header}</span>
                    {col.filterComponent && (
                      <div className="mt-1">
                        {col.filterComponent({
                          value: filtersValueDefault[col?.accessorKey] || localFilters[col.accessorKey],
                          onChange: (value) => handleFilterChange(col.accessorKey, value),
                        })}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingComponent />
            ) :  (
              filteredData.map((row, index) => {
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.accessorKey} className="p-2 text-sm text-gray-700">
                        { col.cell ? col.cell({ getValue: () => row[col.accessorKey], row }) : row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {pagination.totalPages >= 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <select
                id="limit"
                value={limit || 10}
                onChange={(e) => onChangeLimit(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 15, 20,50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
             </div>
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };