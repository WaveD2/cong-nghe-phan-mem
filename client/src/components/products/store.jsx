import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProducts } from '../../context/productContext';
import { debounce } from '../../hepler';
import ProductCard from '../products/productCard';
import ProductSkeleton from '../skeleton/product-skeleton';
import SidebarComponent from '../products/sideBarComponent';
import { Search, X, Filter, Grid, List, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const Store = () => {
  const { 
    products, 
    loading, 
    error, 
    filters,
    setFilter, 
    setPriceRangeFilter,
    setPageFilter,
    resetFilters,
    clearError 
  } = useProducts();

  const [localState, setLocalState] = useState({
    minPrice: 0,
    maxPrice: 100000000,
    searchQuery: '',
    showFilters: false,
    viewMode: 'grid',
    sortBy: 'name'
  });

  useEffect(() => {
    setLocalState(prev => ({
      ...prev,
      searchQuery: filters.title || '',
      minPrice: filters.price ? Number(filters.price.split('-')[0]) || 0 : 0,
      maxPrice: filters.price ? Number(filters.price.split('-')[1]) || 100000000 : 100000000,
    }));
  }, [filters]);

  const debouncedSearch = useCallback(debounce((value) => {
    setFilter({ target: { name: 'title', value } });
  }, 500), [setFilter]);

  const debouncedPriceFilter = useCallback(debounce((range) => {
    setPriceRangeFilter(range);
  }, 800), [setPriceRangeFilter]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalState(prev => ({ ...prev, searchQuery: value }));
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handlePriceChange = useCallback((type, value) => {
    const numValue = Math.max(0, Number(value) || 0);
    setLocalState(prev => {
      const newState = { ...prev, [type === 'min' ? 'minPrice' : 'maxPrice']: numValue };
      const { minPrice, maxPrice } = newState;
      if (minPrice >= 0 && maxPrice >= minPrice) debouncedPriceFilter(`${minPrice}-${maxPrice}`);
      return newState;
    });
  }, [debouncedPriceFilter]);

  const toggleFilters = useCallback(() => {
    setLocalState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  const toggleViewMode = useCallback(() => {
    setLocalState(prev => ({ ...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    const totalPages = products?.pagination?.totalPages || 1;
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setPageFilter(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [products?.pagination?.totalPages, loading, setPageFilter]);

  const clearSearch = useCallback(() => {
    setLocalState(prev => ({ ...prev, searchQuery: '' }));
    debouncedSearch('');
  }, [debouncedSearch]);

  const paginationData = useMemo(() => {
    const totalPages = products?.pagination?.totalPages || 1;
    const currentPage = filters.page || 1;
    const totalItems = products?.pagination?.total || 0;
    const itemsPerPage = products?.pagination?.limit || 12;
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return { totalPages, currentPage, totalItems, startItem, endItem };
  }, [products?.pagination, filters.page]);

  const paginationButtons = useMemo(() => {
    const { totalPages, currentPage } = paginationData;
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);
    for (let i = startPage; i <= endPage; i++) buttons.push(i);
    return buttons;
  }, [paginationData]);

  const hasActiveFilters = useMemo(() => {
    return filters.title || filters.category || filters.price || filters.tags || filters.brands || filters.discount;
  }, [filters]);

  const productsData = products?.data || [];
  const hasProducts = productsData.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Store</h1>
                <p className="text-sm text-gray-500">Browse our curated collection</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                  <Filter size={16} /> Filters
                  {hasActiveFilters && <span className="h-2 w-2 bg-blue-500 rounded-full" />}
                </button>
                <button
                  onClick={toggleViewMode}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                  title={`Switch to ${localState.viewMode === 'grid' ? 'list' : 'grid'}`}
                >
                  {localState.viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>
              </div>
            </div>

            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={localState.searchQuery}
                onChange={handleSearchChange}
                disabled={loading}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 text-sm"
              />
              {localState.searchQuery && (
                <button
                  onClick={clearSearch}
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg flex justify-between items-center">
              <span className="text-sm text-red-700">{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Main Layout */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <aside className={`${localState.showFilters ? 'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg lg:static lg:block' : 'hidden lg:block'}`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b lg:hidden">
                  <h3 className="text-lg font-medium">Filters</h3>
                  <button onClick={toggleFilters} className="p-1 hover:bg-gray-100 rounded">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <SidebarComponent
                    setFilter={setFilter}
                    setPriceRangeFilter={debouncedPriceFilter}
                    handlePriceRangeChange={(e) => handlePriceChange(e.target.name === 'min' ? 'min' : 'max', e.target.value)}
                    minPrice={localState.minPrice}
                    maxPrice={localState.maxPrice}
                    loading={loading}
                    className={"md:mt-[194px]"}
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="m-4 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Overlay */}
            {localState.showFilters && (
              <div onClick={toggleFilters} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
            )}

            {/* Products */}
            <main className="flex flex-col gap-6">
              {loading ? (
                <div className={`grid gap-4 ${localState.viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                  {Array(8).fill().map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : !hasProducts ? (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">No Products Found</h2>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-gray-600">
                    Showing {paginationData.startItem}-{paginationData.endItem} of {paginationData.totalItems} products
                    {hasActiveFilters && <span className="ml-2 text-blue-600">Filtered</span>}
                  </div>
                  <div className={`grid gap-4 ${localState.viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                    {productsData.map(product => (
                      <ProductCard key={product._id || product.id} product={product} viewMode={localState.viewMode} />
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
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
                    {paginationButtons.map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${page === paginationData.currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;