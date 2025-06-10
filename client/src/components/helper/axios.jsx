import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 40000,
  headers: {
    "ngrok-skip-browser-warning": true,
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

const pendingRequests = new Map();

apiClient.interceptors.response.use(
  (response) => {
    // Remove request from pending list on success
    const requestKey = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  async (error) => {
    const config = error.config;

    config._retry = config._retry || false;

    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;

      const requestKey = `${config.method}:${config.url}`;
      
      if (pendingRequests.has(requestKey)) {
        return Promise.reject(new Error("Request already in progress"));
      }

      pendingRequests.set(requestKey, true);

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = apiClient
            .post("/api/user-service/refreshToken", {}, { withCredentials: true })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        await refreshPromise;
        const response = await apiClient(config);
        pendingRequests.delete(requestKey);
        return response;
      } catch (refreshError) {
        pendingRequests.delete(requestKey);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;