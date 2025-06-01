import  { useState, useEffect, useCallback } from 'react';
import {useProducts} from '../../context/productContext';
import { debounce } from '../../hepler';
import ProductCard from '../products/productCard';
import ProductSkeleton from '../skeleton/product-skeleton';
import SidebarComponent from '../products/sideBarComponent';

const Store = () => {
  const { 
    products, 
    loading, 
    error, 
    filters,
    setFilter, 
    setPriceRangeFilter,
    setPageFilter,
    clearError 
  } = useProducts();
  
  const [localState, setLocalState] = useState({
    minPrice: 0,
    maxPrice: 100000000,
    searchQuery: '',
    category: ''
  });

  console.log("Store products:", products);
  

  // Sync local state with URL filters
  useEffect(() => {
    setLocalState(prev => ({
      ...prev,
      searchQuery: filters.title || '',
      minPrice: filters.price ? Number(filters.price.split('-')[0]) || 0 : 0,
      maxPrice: filters.price ? Number(filters.price.split('-')[1]) || 100000000 : 100000000,
      category: filters.category || ''
    }));
  }, [filters]);

  // Debounced functions
  const debouncedSetTitleFilter = useCallback(
    debounce((value) => {
      const event = { target: { name: 'title', value } };
      setFilter(event);
    }, 300),
    []
  );

  const debouncedSetPriceFilter = useCallback(
    debounce((range) => {
      setPriceRangeFilter(range);
    }, 300),
    []
  );

  // Handle price range changes
  const handlePriceRangeChange = useCallback((e) => {
    const { name, value } = e.target;
    const numValue = Math.max(0, Number(value) || 0);
    
    setLocalState(prev => ({
      ...prev,
      [name === 'min' ? 'minPrice' : 'maxPrice']: numValue
    }));
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalState(prev => ({ ...prev, searchQuery: value }));
    debouncedSetTitleFilter(value);
  }, [debouncedSetTitleFilter]);

  // Update price filter when min/max changes
  useEffect(() => {
    const { minPrice, maxPrice } = localState;
    if (minPrice >= 0 && maxPrice >= minPrice) {
      debouncedSetPriceFilter(`${minPrice}-${maxPrice}`);
    }
  }, [localState.minPrice, localState.maxPrice, debouncedSetPriceFilter]);

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    const totalPages = products?.pagination?.totalPages || 1;
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setPageFilter(newPage);
    }
  }, [products?.pagination?.totalPages, loading, setPageFilter]);

  // Sync current page with products data
  useEffect(() => {
    if (products?.pagination?.page) {
      // Current page is managed by filters.page from URL
    }
  }, [products?.pagination?.page]);

  // Handle search button click
  const handleSearchClick = useCallback(() => {
    debouncedSetTitleFilter(localState.searchQuery);
  }, [localState.searchQuery, debouncedSetTitleFilter]);

  // Generate pagination buttons
  const getPaginationButtons = useCallback(() => {
    const totalPages = products?.pagination?.totalPages || 1;
    const currentPage = filters.page || 1;
    const buttons = [];
    const maxButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          aria-label="Go to page 1"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="start-ellipsis" className="px-3 py-1 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={loading}
          aria-label={`Go to page ${i}`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="px-3 py-1 text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [products?.pagination?.totalPages, filters.page, loading, handlePageChange]);

  // Enhanced sidebar props
  const sidebarProps = {
    setFilter,
    setPriceRangeFilter: debouncedSetPriceFilter,
    handlePriceRangeChange,
    minPrice: localState.minPrice,
    maxPrice: localState.maxPrice,
    loading
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className=" rounded-xl p-6 h-fit">
          <SidebarComponent {...sidebarProps} />
        </aside>

        {/* Main Content */}
        <main className="flex flex-col">
          {/* Search Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                name="title"
                placeholder="Search products..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={localState.searchQuery}
                onChange={handleSearchChange}
                disabled={loading}
                aria-label="Search products"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleSearchClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 whitespace-nowrap"
              disabled={loading}
              aria-label="Search products"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-red-500 hover:text-red-700 font-bold"
                aria-label="Close error message"
              >
                ×
              </button>
            </div>
          )}

          {/* Results Summary */}
          {!loading && products?.data && (
            <div className="mb-4 text-sm text-gray-600">
              {products.pagination ? (
                <span>
                  Showing {((products.pagination.page - 1) * products.pagination.limit) + 1} - {Math.min(products.pagination.page * products.pagination.limit, products.pagination.total)} of {products.pagination.total} products
                  {(filters.title || filters.category || filters.price || filters.tags || filters.brands) && (
                    <span className="ml-2 text-blue-600">
                      (filtered)
                    </span>
                  )}
                </span>
              ) : (
                <span>{products.data.length} products found</span>
              )}
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <ProductSkeleton key={`skeleton-${idx}`} />
              ))
            ) : products?.data?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl text-gray-600 font-semibold mb-2">
                  No products found
                </h2>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              products?.data?.map((product) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={product} 
                />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {products?.pagination?.totalPages > 1 && (
            <nav 
              className="flex justify-center items-center gap-4 mt-auto" 
              aria-label="Product pagination"
              role="navigation"
            >
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1 || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                aria-label="Go to previous page"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2" role="group" aria-label="Page navigation">
                {getPaginationButtons()}
              </div>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === products?.pagination?.totalPages || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
};

export default Store;