import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { useProducts } from '../../context/productContext';
import { debounce } from '../../hepler';
import ProductCard from '../products/productCard';
import ProductSkeleton from '../skeleton/product-skeleton';
import { Search, X, Grid, List, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { CATEGORIES , BRANDS} from "../../constant.js";
 
const Store = () => {
  const { 
    products, 
    loading, 
    error, 
    resetFilters,
    clearError 
  } = useProducts();
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate(); 
  const location = useLocation();

  const updateParam = useCallback(
    (key, value) => {
      const newParams = new URLSearchParams(location.search);  
      if (value != null && value !== '') {
        newParams.set(key, value);  
      } else {
        newParams.delete(key);  
      }
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    },
    [location.search, navigate] 
  );

  // Debounced update for title param
  const debouncedSetTitle = useMemo(
    () =>
      debounce((value) => {
        updateParam('title', value.trim());
      }, 500),
    [updateParam]
  );

  const handleSearchChange = useCallback(
    (e) => {
      debouncedSetTitle(e.target.value);
    },
    [debouncedSetTitle]
  );

  const handleCategoryChange = useCallback(
    (selectedOption) => {
      updateParam('category', selectedOption?.value || null);
    },
    [updateParam]
  );

  const handleBrandChange = useCallback(
    (selectedOptions) => {
      if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
        const list = selectedOptions.map((opt) => opt.value).join(',');
        updateParam('brands', list);
      } else {
        updateParam('brands', null);
      }
    },
    [updateParam]
  );

  const clearAllFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const paginationData = useMemo(() => {
    const totalPages = products?.pagination?.totalPages || 1;
    const currentPage = Number(new URLSearchParams(location.search).get('page')) || 1;
    const totalItems = products?.pagination?.total || 0;
    const itemsPerPage = products?.pagination?.limit || 12;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return { totalPages, currentPage, totalItems, startItem, endItem };
  }, [products?.pagination, location.search]);

  const paginationButtons = useMemo(() => {
    const { totalPages, currentPage } = paginationData;
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    return buttons;
  }, [paginationData]);

  const handlePageChange = useCallback(
    (newPage) => {
      const { totalPages } = paginationData;
      if (newPage >= 1 && newPage <= totalPages && !loading) {
        updateParam('page', String(newPage));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [paginationData, loading, updateParam]
  );

  const hasProducts = (products?.data || []).length > 0;
  const hasActiveFilters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get('title') ||
      params.get('category') ||
      params.get('brands') 
    );
  }, [location.search]);

  const params = new URLSearchParams(location.search);
  const selectedCategoryOption =
    CATEGORIES.find((opt) => opt.value === params.get('category')) || null;

  const selectedBrandOptions = BRANDS
    .map((b) => ({ label: b, value: b }))
    .filter((opt) => {
      const brParams = params.get('brands');
      return brParams ? brParams.split(',').includes(opt.value) : false;
    });


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Cửa hàng</h1>
            <button
              onClick={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
              title={`Chuyển sang ${viewMode === 'grid' ? 'list' : 'grid'}`}
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
            </button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              defaultValue={params.get('title') || ''}
              onChange={handleSearchChange}
              disabled={loading}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 text-sm"
            />
            {params.get('title') && (
              <button
                onClick={() => updateParam('title', null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={18} />
            )}
          </div>
        </div>

        {/* Horizontal Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-end">
          {/* Category */}
          <div className="w-full sm:w-1/4 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <Select
              options={CATEGORIES}
              value={selectedCategoryOption}
              onChange={handleCategoryChange}
              isClearable
              placeholder="Chọn danh mục..."
            />
          </div>

          {/* Brands */}
          <div className="w-full sm:w-1/4 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
            <Select
              options={BRANDS.map((b) => ({ label: b, value: b }))}
              value={selectedBrandOptions}
              onChange={handleBrandChange}
              isMulti
              isClearable
              placeholder="Chọn thương hiệu..."
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg flex justify-between items-center">
            <span className="text-sm text-red-700">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Products & Pagination */}
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : !hasProducts ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy sản phẩm</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-gray-600">
                Có {paginationData.startItem}-{paginationData.endItem} trên{' '}
                <span className="text-blue-500 font-bold">{paginationData.totalItems}</span> sản phẩm
              </div>
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {products.data.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {paginationData.totalPages > 1 && !loading && (
            <nav className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {paginationData.currentPage} of {paginationData.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(paginationData.currentPage - 1)}
                  disabled={paginationData.currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                {paginationButtons.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg ${
                      page === paginationData.currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(paginationData.currentPage + 1)}
                  disabled={paginationData.currentPage === paginationData.totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default Store;
