import axios from "axios";

const apiClient = axios.create({
  baseURL: 'https://smashing-valid-jawfish.ngrok-free.app',
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
    
    // Initialize retry count if not set
    config._retryCount = config._retryCount || 0;
    
    // Check if we've exceeded max retries or if it's a non-401 error
    if (config._retryCount >= 2 || (error.response?.status !== 401)) {
      return Promise.reject(error);
    }

    // Handle 401 errors
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = apiClient.post("/api/user-service/refreshToken", {
          withCredentials: true,
        })
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

    config._retryCount++;
    const backoffDelay = Math.pow(2, config._retryCount) * 1000; // 1s, 2s for retries
    
    try {
      await delay(backoffDelay);
      return apiClient(config);
    } catch (retryError) {
      return Promise.reject(retryError);
    }
  }
);

export default apiClient;