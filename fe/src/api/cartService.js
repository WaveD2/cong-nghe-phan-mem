import { api } from "./api";
import { apiInterceptors } from "./axiosInstance";

export const getCart = () => {
  return apiInterceptors.get('/cart-service/cart');
};

export const addToCart = ({ productId, quantity }) => {
  return apiInterceptors.post('/cart-service/cart',  { productId, quantity });
};

export const updateCartItem = (itemId, quantity) => {
  return apiInterceptors.put(`/cart-service/cart/${itemId}`, { quantity });
};

export const removeFromCart = (itemId) => {
  return apiInterceptors.delete(`/cart-service/cart/${itemId}`);
};

export const clearCart = () => {
  return apiInterceptors.delete('/cart-service/cart');
};