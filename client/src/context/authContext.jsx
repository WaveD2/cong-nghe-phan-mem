import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../components/helper/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    avatar: '',
    phone: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiClient.post('/api/user-service/verifyme', {}, {
          withCredentials: true,
        });
        if (res.data.success) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Parse URL query parameters
  const getQueryParams = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      search: searchParams.get('search') || '',
      filter: searchParams.get('filter') || '',
      page: parseInt(searchParams.get('page')) || 1,
      limit: parseInt(searchParams.get('limit')) || 10
    };
  }, [location.search]);

  // Update URL query parameters
  const updateQueryParams = useCallback((params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  }, [navigate, location.pathname]);

  // Register function
  const registerAdmin = async ({name, email, password, role,phone ,isActive ,avatar }) => {
    try {
      const res = await apiClient.post('/api/user-service/admin-create', {
        name,
        email,
        password,
        phone,
        avatar,
        isActive,
        role
      }, {
        withCredentials: true
      });
      return res;
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  const register = async ({name, email, password, role,phone ,isActive ,avatar }) => {
    try {
      const res = await apiClient.post('/api/user-service/register', {
        name,
        email,
        password,
        phone,
        avatar,
        isActive,
        role
      }, {
        withCredentials: true
      });
      return res;
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/api/user-service/login', {
        email,
        password
      }, {
        withCredentials: true
      });
      if (res.data.success) {
        setUser(res.data.data);
        setIsAuthenticated(true);
      }
      return res;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.post('/api/user-service/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  // Forgot password request
  const requestForgotPassword = async (email) => {
    try {
      const res = await apiClient.post('/api/user-service/forgot-password/request', { email }, {
        withCredentials: true
      });
      return res;
    } catch (err) {
      console.error('Forgot password request error:', err);
      throw err;
    }
  };

  // Confirm forgot password OTP
  const confirmForgotPassword = async (email, otp) => {
    try {
      const res = await apiClient.post('/api/user-service/forgot-password/confirm', { email, otp }, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error('Confirm forgot password error:', err);
      throw err;
    }
  };

  // Reset password
  const forgotPassword = async (email, password) => {
    try {
      const res = await apiClient.post('/api/user-service/forgot-password', {
        email,
        newPassword: password
      }, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error('Reset password error:', err);
      throw err;
    }
  };

  // Get all users with search and filter
  const getAdminAllUsers = async (customParams = {}) => {
    try {
      const queryParams = { ...getQueryParams(), ...customParams };
      const searchParams = new URLSearchParams();
      
      if (queryParams.search) searchParams.set('search', queryParams.search);
      if (queryParams.filter) searchParams.set('filter', queryParams.filter);
      if (queryParams.page) searchParams.set('page', queryParams.page);
      if (queryParams.limit) searchParams.set('limit', queryParams.limit);

      const res = await apiClient.get(`/api/user-service?${searchParams.toString()}`, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error('Get all users error:', err);
      throw err;
    }
  };

  // Get user by ID
  const getAdminUsersById = async (id) => {
    try {
      const res = await apiClient.get(`/api/user-service/${id}`, {
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      console.error('Get user by id error:', err);
      throw err;
    }
  };

  // Update user
  const adminUserUpdate = async (id, userData) => {
    try {
      const res = await apiClient.put(`/api/user-service/${id}`, userData, {
        withCredentials: true
      });
      // Update current user if the updated user is the current user
      if (user && user.id === id) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  // xóa
  const adminUserDelete = async (id) => {
    try {
      const res = await apiClient.delete(`/api/user-service/admin-delete/${id}`, {
        withCredentials: true
      });

      return res.data
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  const updateCurrentUser = async (userData) => {
    try {
      const res = await apiClient.put(`/api/user-service/me`, userData, {
        withCredentials: true
      });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      console.error('Update current user error:', err);
      throw err;
    }
  };

  // Search and filter users
  const searchAndFilterUsers = async (searchTerm, filter, page = 1, limit = 10) => {
    try {
      const params = { search: searchTerm, filter, page, limit };
      updateQueryParams(params);
      return await getAdminAllUsers(params);
    } catch (err) {
      console.error('Search and filter users error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      registerAdmin,
      logout,
      requestForgotPassword,
      confirmForgotPassword,
      forgotPassword,
      getAdminAllUsers,
      getAdminUsersById,
      adminUserUpdate,
      updateCurrentUser,
      searchAndFilterUsers,
      getQueryParams,
      adminUserDelete
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};