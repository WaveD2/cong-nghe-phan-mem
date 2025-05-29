import { api } from "./api";
import { apiInterceptors } from "./axiosInstance";

// API công khai (public)
export const getProducts = () => {
  return api.get('/product-service');
};

export const getProductById = (id) => {
  return api.get(`/product-service/${id}`);
};

export const searchProducts = (query) => {
  return api.get(`/product-service/search?q=${query}`);
};

// API cần xác thực (authenticated, ví dụ: quyền admin)
export const createProduct = (data) => {
  return apiInterceptors.post('/product-service', data);
};

export const updateProduct = (
  id,
  data
) => {
  return apiInterceptors.put(`/product-service/${id}`, data);
};

export const deleteProduct = (id) => {
  return apiInterceptors.delete(`/product-service/${id}`);
};