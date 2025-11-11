// src/api/axiosInstance.js
import axios from "axios";
import { store } from "../store";
import { refreshAccessToken, logout } from "../store/authSlice";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Gắn accessToken vào header
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý 401 → tự động refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ refresh 1 lần duy nhất
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token từ Redux
        await store.dispatch(refreshAccessToken()).unwrap();

        // Lấy accessToken mới từ store và thử lại request
        const newToken = store.getState().auth.accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → logout + redirect
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;