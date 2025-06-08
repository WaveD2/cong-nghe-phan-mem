import axios from "axios";

const apiClient = axios.create({
  baseURL: 'http://localhost:80',
  timeout: 40000,
  headers: {
    "ngrok-skip-browser-warning": true,
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Khởi tạo _retryCount nếu chưa có
    config._retryCount = config._retryCount || 0;

    // Nếu đã thử 3 lần, từ chối ngay lập tức
    if (config._retryCount >= 1) {
      return Promise.reject(error);
    }

    // Tăng số lần thử
    config._retryCount++;

    // Xử lý lỗi 401 (refresh token)
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = apiClient.post("/api/user-service/refreshToken", {}, { withCredentials: true })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return apiClient(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác với cơ chế backoff
    const backoffDelay = Math.pow(2, config._retryCount) * 1000;

    try {
      await delay(backoffDelay);
      return apiClient(config);
    } catch (retryError) {
      return Promise.reject(retryError);
    }
  }
);

export default apiClient;