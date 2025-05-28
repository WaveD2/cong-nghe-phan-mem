import { api } from "./api";
import { apiInterceptors } from "./axiosInstance";

export const apiUser = {
  loginEmail: (data) => {
    return api.post("/user-service/login-email", data);
  },

  register: (data) => {
    return api.post("/user-service/register", data);
  },

  getUserInfo: () => {
    return apiInterceptors.get("/user-service/user");
  },

  updateUserInfo: (data) => {
    return apiInterceptors.put("/user-service/user", data);
  },

  changePassword: (data) => {
    return apiInterceptors.put("/user-service/change-password", data);
  },

  forgotPassword: (email) => {
    return api.post("/user-service/forgot-password", { email });
  },

  resetPassword: (data) => {
    return api.post("/user-service/reset-password", data);
  },
  login: (data) => {
    return api.post("/user-service/login", data);
  },
  logout: () => {
    return api.post("/user-service/logout");
  },
};