import  { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import apiClient from '../components/helper/axios';
import { useToast } from './toastContext';

const ProductContext = createContext();

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

  const [products, setProducts] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSelected, setIsSelected] = useState([]);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    title: '',
    price: '',
    category: '',
    discount: null,
    tags: '',
    brands: '',
    page: 1,
    limit: 12,
  });

  // Helper function to parse URL parameters to filters
  const parseUrlToFilters = useCallback(() => {
    const urlFilters = {
      title: searchParams.get('title') || '',
      price: searchParams.get('price') || '',
      category: searchParams.get('category') || '',
      discount: searchParams.get('discount') ? Number(searchParams.get('discount')) : null,
      tags: searchParams.get('tags') || '',
      brands: searchParams.get('brands') || '',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
    };
    
    return urlFilters;
  }, [searchParams]);

  // Helper function to update URL with filters
  const updateUrlWithFilters = useCallback((newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined && value !== 0) {
        if (key === 'page' && value === 1) return; // Don't show page=1 in URL
        params.set(key, String(value));
      }
    });

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleApiError = useCallback((error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    let errorMessage = defaultMessage;
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.issues && Array.isArray(errorData.issues)) {
        errorMessage = errorData.issues.map(issue => issue.message).join(', ');
      }
      else if (errorData.message) {
        errorMessage = errorData.message;
      }
      else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ');
      }
    }
    
    setError(errorMessage);
    showToast(errorMessage, 'error');
    return errorMessage;
  }, [showToast]);

  useEffect(() => {
    const urlFilters = parseUrlToFilters();
    setFilters(urlFilters);
    
    const selectedItems = [];
    Object.entries(urlFilters).forEach(([key, value]) => {
      if (value && ['category', 'tags', 'brands'].includes(key)) {
        selectedItems.push(value);
      }
    });
    setIsSelected(selectedItems);
  }, [location.pathname, parseUrlToFilters]);
 
  const fetchProducts = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = customFilters || filters;
      
      const cleanFilters = Object.entries(filterParams).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await apiClient.get('/api/product-service', { 
        params: cleanFilters 
      });
      
      if (response.data) {
        setProducts(response.data);
        return response.data;
      }
      
    } catch (err) {
      handleApiError(err, 'Error fetching products');
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, handleApiError]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const setPriceRangeFilter = useCallback((price) => {
    const newFilters = { ...filters, price, page: 1 };
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  }, [filters, updateUrlWithFilters]);

  const setPageFilter = useCallback((page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  }, [filters, updateUrlWithFilters]);

  // Home filter product
  const homeFilterProduct = useCallback(async (productType) => {
    try {
      const newFilters = {
        title: '',
        price: '',
        category: productType,
        discount: null,
        tags: '',
        brands: '',
        page: 1,
        limit: filters.limit,
      };
      
      setFilters(newFilters);
      updateUrlWithFilters(newFilters);
      return await fetchProducts(newFilters);
    } catch (error) {
      handleApiError(error, 'Error filtering products');
      return [];
    }
  }, [filters.limit, updateUrlWithFilters, fetchProducts, handleApiError]);

  // Set filter with toggle functionality
  const setFilter = useCallback((e) => {
    const { name, value } = e.target;
    
    let newFilters = { ...filters };
    
    // Toggle functionality for selected items
    if (['category', 'tags', 'brands'].includes(name) && isSelected.includes(value)) {
      setIsSelected(prev => prev.filter(item => item !== value));
      newFilters[name] = '';
    } else {
      if (['category', 'tags', 'brands'].includes(name)) {
        setIsSelected(prev => [...prev.filter(item => item !== filters[name]), value]);
      }
      newFilters[name] = value;
    }
    
    // Reset page when filtering
    newFilters.page = 1;
    
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  }, [filters, isSelected, updateUrlWithFilters]);

  // Set multiple filters at once
  const setMultipleFilters = useCallback((newFilterValues) => {
    const newFilters = { ...filters, ...newFilterValues, page: 1 };
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  }, [filters, updateUrlWithFilters]);

  // Get home products by category
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

  // Get product by ID
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

  // Get all admin products
  const getAdminAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/product-service');
      
      if (response.data) {
        setAdminProducts(response.data);
      }
      
    } catch (err) {
      handleApiError(err, 'Error fetching admin products');
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  // Update admin product
  const adminProductUpdate = useCallback(async (id, data) => {
    if (!id || !data) {
      showToast('Product ID and data are required', 'error');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put(`/api/product-service/${id}`, data);
      
      if (response.data?.success) {
        showToast('Product updated successfully', 'success');
        
        // Update local state
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

  // Delete admin product
  const adminProductDelete = useCallback(async (id) => {
    if (!id) {
      showToast('Product ID is required', 'error');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.delete(`/api/product-service/${id}`);
      
      if (response.data?.success) {
        showToast('Product deleted successfully', 'success');
        
        // Update local state
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

  // Create admin product
  const adminCreateProduct = useCallback(async (data) => {
    if (!data) {
      showToast('Product data is required', 'error');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/api/product-service', data);
      
      if (response.data?.success) {
        showToast('Product created successfully', 'success');
        
        // Update local state
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      title: '',
      price: '',
      category: '',
      discount: null,
      tags: '',
      brands: '',
      page: 1,
      limit: 12,
    };
    
    setFilters(defaultFilters);
    setIsSelected([]);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Navigate to store with filters
  const navigateToStore = useCallback((filterParams = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });

    navigate(`/store?${params.toString()}`);
  }, [navigate]);

  const contextValue =  {
    products,
    adminProducts,
    loading,
    error,
    filters,
    isSelected,
    fetchProducts,
    setPriceRangeFilter,
    setPageFilter,
    homeFilterProduct,
    setFilter,
    setMultipleFilters,
    getHomeProducts,
    getProductById,
    getAdminAllProducts,
    adminProductUpdate,
    adminProductDelete,
    adminCreateProduct,
    clearError,
    resetFilters,
    navigateToStore,
    setLoading,
    updateUrlWithFilters,
    parseUrlToFilters,
  } ;

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;