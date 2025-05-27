import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

// Constants
const API_URL =
  process.env.NEXT_PUBLIC_SASASASA_API_URL || "http://localhost:8000";
const TOKEN_REFRESH_ENDPOINT = "/api/v1/accounts/refresh";
const MAX_RETRIES = 1;

// Types
interface TokenResponse {
  access: string;
  refresh: string;
}

interface ApiResponse<T = any> {
  result: T;
  message?: string;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Token management
const TokenManager = {
  getAccessToken: () => Cookies.get("accessToken"),
  getRefreshToken: () => Cookies.get("refreshToken"),
  setTokens: (access: string, refresh: string) => {
    Cookies.set("accessToken", access, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    Cookies.set("refreshToken", refresh, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  },
  clearTokens: () => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
  },
  redirectToLogin: () => {
    window.location.href = "/login";
  },
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const analytics = useAnalytics();
    const logger = useLogger({ context: "API" });
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle network errors
    if (!error.response) {
      logger.error("Network error occurred", error);
      analytics.trackError(error as Error, { type: "network_error" });
      return Promise.reject(new ApiError(0, "Network error occurred"));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          logger.warn("No refresh token available");
          TokenManager.clearTokens();
          TokenManager.redirectToLogin();
          return Promise.reject(
            new ApiError(401, "No refresh token available")
          );
        }

        const response = await axios.post<ApiResponse<TokenResponse>>(
          `${API_URL}${TOKEN_REFRESH_ENDPOINT}`,
          {
            refresh: refreshToken,
          }
        );

        const { access, refresh } = response.data.result;
        TokenManager.setTokens(access, refresh);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logger.error("Failed to refresh token", refreshError);
        analytics.trackError(refreshError as Error, {
          type: "token_refresh_error",
        });
        TokenManager.clearTokens();
        TokenManager.redirectToLogin();
        return Promise.reject(new ApiError(401, "Failed to refresh token"));
      }
    }

    // Handle other errors
    const errorMessage = error.response.data?.message || "An error occurred";
    logger.error("API error occurred", {
      status: error.response.status,
      message: errorMessage,
      data: error.response.data,
    });
    analytics.trackError(error as Error, {
      type: "api_error",
      status: error.response.status,
      message: errorMessage,
    });
    return Promise.reject(
      new ApiError(error.response.status, errorMessage, error.response.data)
    );
  }
);

// Request cancellation
const createCancellationToken = () => {
  return axios.CancelToken.source();
};

// Helper functions
const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new ApiError(
      axiosError.response?.status || 0,
      axiosError.response?.data?.message || "An error occurred",
      axiosError.response?.data
    );
  }
  throw new ApiError(500, "An unexpected error occurred");
};

// API client class
class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;

  private constructor() {
    this.api = axiosInstance;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public getApi(): AxiosInstance {
    return this.api;
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    console.log("params", params);
    try {
      // Extract the actual params from the nested structure
      const actualParams = params?.params || params || {};
      const response = await this.api.get<T>(url, params);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  public async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  public async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const apiClient = ApiClient.getInstance();
export { ApiError, createCancellationToken, handleApiError, type ApiResponse };
