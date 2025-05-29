import axios from 'axios';

const BASE_URL = 'https://smashing-valid-jawfish.ngrok-free.app';

const apiInterceptors = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInterceptors.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInterceptors.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);

export { apiInterceptors };
