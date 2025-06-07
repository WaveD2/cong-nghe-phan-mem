import axios from "axios";

const apiClient = axios.create({
  // baseURL: "http://localhost:80",
  baseURL:import.meta.env.VITE_API_URL,
    // baseURL: "https://store-one-henna.vercel.app/api",
  timeout: 40000,
  headers: {
    // "Content-Type": "application/json",
    "ngrok-skip-browser-warning": true,
    // "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = apiClient.post("/api/user-service/refreshToken" , {
           withCredentials: true,
        })
          .finally(() => (isRefreshing = false));
      }

      try {
        await refreshPromise;
        return apiClient(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
