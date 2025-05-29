import { apiInterceptors } from './axiosConfig';

export const createOrder = ({street, city, state}) => {
  return apiInterceptors.post('/order-service/orders', {street, city, state});
};

export const getOrders = () => {
  return apiInterceptors.get('/order-service/orders');
};

export const getOrderById = (id) => {
  return apiInterceptors.get(`/order-service/orders/${id}`);
};

export const cancelOrder = (id) => {
  return apiInterceptors.delete(`/order-service/orders/${id}`);
};