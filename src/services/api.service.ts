import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { cookieService } from "./cookie.service";

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
  getAccessToken: () => cookieService.getTokens()?.result?.access,
  getRefreshToken: () => cookieService.getTokens()?.result?.refresh,
  redirectToLogin: () => {
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  },
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
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
  (error) => {
    return Promise.reject(error);
  }
);

// Server-side logger
const serverLogger = {
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === "development") {
      const errorDetails = error
        ? {
            status: error.status,
            data: error.data,
            name: error.name,
          }
        : {};
      console.log(`[API Error] ${message}`, errorDetails);
    }
  },
  warn: (message: string, details?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Warning] ${message}`, details);
    }
  },
  info: (message: string, details?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Info] ${message}`, details);
    }
  },
};

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle network errors
    if (!error.response) {
      serverLogger.error("Network error occurred", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      return Promise.reject(new ApiError(0, "Network error occurred"));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          serverLogger.warn("No refresh token available", {
            url: originalRequest.url,
            method: originalRequest.method,
          });
          cookieService.clearAuth();
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
        cookieService.setTokens({
          status: "success",
          message: "Token Data",
          result: { access, refresh },
        });

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        serverLogger.error("Failed to refresh token", {
          error: refreshError,
          originalRequest: {
            url: originalRequest.url,
            method: originalRequest.method,
          },
        });
        cookieService.clearAuth();
        TokenManager.redirectToLogin();
        return Promise.reject(new ApiError(401, "Failed to refresh token"));
      }
    }

    // Handle other errors
    const errorMessage = error.response.data?.message || "An error occurred";
    const errorDetails = {
      status: error.response.status,
      message: errorMessage,
      data: error.response.data,
      url: originalRequest.url,
      method: originalRequest.method,
      headers: originalRequest.headers,
    };

    serverLogger.error("API error occurred", errorDetails);
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
    const errorDetails = {
      status: axiosError.response?.status,
      message: axiosError.response?.data?.message || "An error occurred",
      data: axiosError.response?.data,
      config: axiosError.config,
    };
    serverLogger.error("API request failed", errorDetails);
    throw new ApiError(
      axiosError.response?.status || 0,
      axiosError.response?.data?.message || "An error occurred",
      axiosError.response?.data
    );
  }
  serverLogger.error("Unexpected error occurred", error);
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

  public async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.api.get<T>(url, {
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, {
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, {
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data, {
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, {
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async postFormData<T>(
    url: string,
    formData: FormData,
    config?: any
  ): Promise<T> {
    try {
      const response = await this.api.post<T>(url, formData, {
        ...config,
        headers: {
          // Ensure multipart content type for FormData uploads
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  public async patchFormData<T>(
    url: string,
    formData: FormData,
    config?: any
  ): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, formData, {
        ...config,
        headers: {
          // Ensure multipart content type for FormData uploads
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export const apiClient = ApiClient.getInstance();
export { ApiError, createCancellationToken, handleApiError, type ApiResponse };
