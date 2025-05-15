import Cookies from "js-cookie";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_SASASASA_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_URL}/api/v1/accounts/refresh`,
          {
            refresh: refreshToken,
          }
        );

        const { access, refresh } = response.data.result;
        Cookies.set("accessToken", access);
        Cookies.set("refreshToken", refresh);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
