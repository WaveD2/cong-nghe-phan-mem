// DataTable.jsx
import   { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { RotatingLines } from "react-loader-spinner";
import { AiOutlineSortAscending, AiOutlineSortDescending, AiOutlineSearch } from "react-icons/ai";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Table({
  columns,
  data,
  pagination,     
  onPageChange,  
  onSort,        
  onSearch,      
  loading,       
}) {
  const [sortState, setSortState] = useState({ id: "", desc: false });
  const [searchTerm, setSearchTerm] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSort = (column) => {
    if (!column.accessorKey) return;
    let isDesc = false;
    if (sortState.id === column.accessorKey) {
      isDesc = !sortState.desc;
    } else {
      isDesc = false;
    }
    setSortState({ id: column.accessorKey, desc: isDesc });
    onSort && onSort(column.accessorKey, isDesc);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch(searchTerm.trim());
  };

  const handlePrev = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };
  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center relative">
        <AiOutlineSearch className="text-gray-500 absolute ml-3 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300 w-64"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Search
        </button>
      </form>

      <div className="relative overflow-x-auto border border-gray-200 rounded-md">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <RotatingLines
              strokeColor="#3b82f6"
              strokeWidth="4"
              animationDuration="0.75"
              width="40"
              visible={true}
            />
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort =
                    header.column.columnDef.enableSorting !== false &&
                    header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      onClick={() =>
                        canSort && handleSort(header.column.columnDef)
                      }
                      className={`px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wider select-none ${
                        canSort ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && header.column.columnDef.accessorKey && (
                          <span className="ml-1">
                            {sortState.id === header.column.columnDef.accessorKey ? (
                              sortState.desc ? (
                                <AiOutlineSortDescending className="inline-block text-gray-500" />
                              ) : (
                                <AiOutlineSortAscending className="inline-block text-gray-500" />
                              )
                            ) : (
                              <AiOutlineSortAscending className="inline-block text-gray-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Tổng{" "}
          <span className="font-medium">{pagination.totalCurrent}</span> trên{" "}
          <span className="font-medium">{pagination.total}</span> 
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            disabled={pagination.page <= 1 || loading}
            className={`p-2 rounded-md border border-gray-300 ${
              pagination.page <= 1 || loading
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm text-gray-700">
            Page <span className="font-medium">{pagination.page}</span> of{" "}
            <span className="font-medium">{pagination.totalPages}</span>
          </span>
          <button
            onClick={handleNext}
            disabled={pagination.page >= pagination.totalPages || loading}
            className={`p-2 rounded-md border border-gray-300 ${
              pagination.page >= pagination.totalPages || loading
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
