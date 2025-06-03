import { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import apiClient from '../components/helper/axios';
import { useToast } from './toastContext';

const ProductContext = createContext();

// Constants
const DEFAULT_FILTERS = {
  title: '',
  price: '',
  category: '',
  discount: null,
  tags: '',
  brands: '',
  page: 1,
  limit: 12,
};

const FILTER_KEYS = Object.keys(DEFAULT_FILTERS);
const SELECTABLE_FILTERS = ['category', 'tags', 'brands'];

// Helper functions
const parseUrlFilters = (searchParams) => {
  const urlFilters = {};
  
  FILTER_KEYS.forEach(key => {
    const value = searchParams.get(key);
    if (value !== null && value !== '') {
      if (key === 'page' || key === 'limit') {
        urlFilters[key] = Number(value) || DEFAULT_FILTERS[key];
      } else if (key === 'discount') {
        urlFilters[key] = Number(value) || null;
      } else {
        urlFilters[key] = value;
      }
    } else {
      urlFilters[key] = DEFAULT_FILTERS[key];
    }
  });
  
  return urlFilters;
};

const buildUrlParams = (filters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      if (key === 'page' && value === 1) return;
      if (key === 'limit' && value === 12) return;
      
      params.set(key, String(value));
    }
  });
  
  return params;
};

const cleanFiltersForApi = (filters) => {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const hasValidFilters = (filters) => {
  return Object.values(cleanFiltersForApi(filters)).length > 0;
};

const filtersEqual = (filters1, filters2) => {
  return JSON.stringify(filters1) === JSON.stringify(filters2);
};

// Custom hook
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const ProductProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  
  // State
  const [products, setProducts] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isSelected, setIsSelected] = useState([]);
  
  // Refs
  const lastApiFiltersRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Error handling
  const handleApiError = useCallback((error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.issues && Array.isArray(errorData.issues)) {
        errorMessage = errorData.issues.map(issue => issue.message).join(', ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ');
      }
    }
    
    setError(errorMessage);
    showToast(errorMessage, 'error');
    return errorMessage;
  }, [showToast]);

  // Update URL
  const updateUrl = useCallback((newFilters) => {
    const params = buildUrlParams(newFilters);
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Update selected items
  const updateSelectedItems = useCallback((currentFilters) => {
    const selectedItems = [];
    SELECTABLE_FILTERS.forEach(key => {
      if (currentFilters[key] && currentFilters[key] !== '') {
        selectedItems.push(currentFilters[key]);
      }
    });
    setIsSelected(selectedItems);
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (customFilters = null) => {
    const filterParams = customFilters || filters;
    const cleanFilters = cleanFiltersForApi(filterParams);
    
    if (!hasValidFilters(filterParams)) {
      setProducts([]);
      return [];
    }
    
    if (lastApiFiltersRef.current && filtersEqual(cleanFilters, lastApiFiltersRef.current)) {
      return products;
    }
    
    try {
      setLoading(true);
      setError(null);
      lastApiFiltersRef.current = cleanFilters;
      
      const response = await apiClient.get('/api/product-service', { 
        params: cleanFilters 
      });
      
      if (response.data) {
        setProducts(response.data);
        return response.data;
      }
      
      return [];
    } catch (err) {
      lastApiFiltersRef.current = null;
      handleApiError(err, 'Error fetching products');
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, products, handleApiError]);

  // Debounced fetch
  const debouncedFetchProducts = useCallback((customFilters = null) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchProducts(customFilters);
    }, 300);
  }, [fetchProducts]);

  // Initialize filters from URL
  const urlFilters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);

  useEffect(() => {
    if (!filtersEqual(urlFilters, filters)) {
      setFilters(urlFilters);
    }
    updateSelectedItems(urlFilters);
    
    if (hasValidFilters(urlFilters)) {
      debouncedFetchProducts(urlFilters);
    } else {
      setProducts([]);
    }
  }, [urlFilters, location.pathname, debouncedFetchProducts, updateSelectedItems, filters]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Filter management
  const updateFilters = useCallback((newFilters, shouldFetch = true) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    updateSelectedItems(updatedFilters);
    updateUrl(updatedFilters);
    
    if (shouldFetch) {
      debouncedFetchProducts(updatedFilters);
    }
  }, [filters, updateSelectedItems, updateUrl, debouncedFetchProducts]);

  const setPriceRangeFilter = useCallback((price) => {
    updateFilters({ price });
  }, [updateFilters]);

  const setPageFilter = useCallback((page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateUrl(newFilters);
    debouncedFetchProducts(newFilters);
  }, [filters, updateUrl, debouncedFetchProducts]);

  const setFilter = useCallback((e) => {
    const { name, value } = e.target;
    
    if (SELECTABLE_FILTERS.includes(name) && isSelected.includes(value)) {
      updateFilters({ [name]: '' });
    } else {
      updateFilters({ [name]: value });
    }
  }, [isSelected, updateFilters]);

  const setMultipleFilters = useCallback((newFilterValues) => {
    updateFilters(newFilterValues);
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setIsSelected([]);
    setSearchParams({}, { replace: true });
    setProducts([]);
    lastApiFiltersRef.current = null;
  }, [setSearchParams]);

  // Home filter product
  const homeFilterProduct = useCallback(async (productType) => {
    try {
      const newFilters = {
        ...DEFAULT_FILTERS,
        category: productType,
        limit: filters.limit,
      };
      
      updateFilters(newFilters, false);
      return await fetchProducts(newFilters);
    } catch (error) {
      handleApiError(error, 'Error filtering products');
      return [];
    }
  }, [filters.limit, updateFilters, fetchProducts, handleApiError]);

  // Navigation
  const navigateToStore = useCallback((filterParams = {}) => {
    const params = buildUrlParams(filterParams);
    navigate(`/store?${params.toString()}`);
  }, [navigate]);

  // Product operations
  const getHomeProducts = useCallback(async (category) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/product-service', { 
        params: { category } 
      });
      
      return response.data || [];
    } catch (err) {
      handleApiError(err, 'Error fetching products by category');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const getProductById = useCallback(async (id) => {
    if (!id) {
      showToast('Product ID is required', 'error');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/product-service/${id}`);
      return response.data;
    } catch (err) {
      handleApiError(err, 'Error fetching product by ID');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiError, showToast]);

  // Admin operations
  const getAdminAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/product-service');
      console.log("getAdminAllProducts", response.data);
      
      if (response.data) {
        setAdminProducts(response.data);
      }
    } catch (err) {
      handleApiError(err, 'Error fetching admin products');
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const adminProductUpdate = useCallback(async (id, data) => {
    if (!id || !data) {
      showToast('Product ID and data are required', 'error');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put(`/api/product-service/${id}`, data);
      console.log("adminProductUpdate", response.data);
      
      if (response.data?.success) {
        showToast('Product updated successfully', 'success');
        
        setAdminProducts(prev => 
          prev.map(product => 
            product.id === id ? { ...product, ...response.data.data } : product
          )
        );
        
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update product');
      }
    } catch (err) {
      handleApiError(err, 'Error updating product');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiError, showToast]);

  const adminProductDelete = useCallback(async (id) => {
    if (!id) {
      showToast('Product ID is required', 'error');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.delete(`/api/product-service/${id}`);
      console.log("adminProductDelete", response.data);
      
      if (response.data?.success) {
        showToast('Product deleted successfully', 'success');
        setAdminProducts(prev => prev.filter(product => product.id !== id));
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to delete product');
      }
    } catch (err) {
      handleApiError(err, 'Error deleting product');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleApiError, showToast]);

  const adminCreateProduct = useCallback(async (data) => {
    if (!data) {
      showToast('Product data is required', 'error');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/api/product-service', data);
      console.log("adminCreateProduct", response.data);
      
      if (response.data?.success) {
        showToast('Product created successfully', 'success');
        
        if (response.data.data) {
          setAdminProducts(prev => [response.data.data, ...prev]);
        }
        
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to create product');
      }
    } catch (err) {
      handleApiError(err, 'Error creating product');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiError, showToast]);

  // Utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const contextValue = {
    products,
    adminProducts,
    loading,
    error,
    filters,
    isSelected,
    setPriceRangeFilter,
    setPageFilter,
    setFilter,
    setMultipleFilters,
    resetFilters,
    fetchProducts,
    homeFilterProduct,
    getHomeProducts,
    getProductById,
    getAdminAllProducts,
    adminProductUpdate,
    adminProductDelete,
    adminCreateProduct,
    clearError,
    navigateToStore,
    setLoading,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;