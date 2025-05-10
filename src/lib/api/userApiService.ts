import {
  AuthResponse,
  DeleteAccountRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RolesResponse,
  TokenResponse,
  UserResponse,
  VerifyOtpRequest,
} from "@/types";
import {
  clearAuthCookies,
  clearUserRoles,
  setAuthCookies,
  setUserRoles,
} from "../auth";

import { AUTH_TOKEN_NAMES } from "../constants";
import Cookies from "js-cookie";
import axios from "./axios";

export const userApi = {
  // Initiates login by sending identifier (email/phone) to get OTP
  login: async (data: LoginRequest) => {
    const response = await axios.post<AuthResponse>(
      "/api/v1/accounts/login",
      data
    );
    return response.data;
  },

  // Verifies OTP code and sets auth tokens in cookies if valid
  verifyOTP: async (data: VerifyOtpRequest) => {
    const response = await axios.post<AuthResponse>(
      "/api/v1/accounts/verify-otp",
      data
    );
    const { tokens, user } = response.data.result;

    await setAuthCookies(tokens.access, tokens.refresh);

    return { user, tokens };
  },

  // Requests a new OTP code to be sent to the user
  resendOTP: async (data: LoginRequest) => {
    const response = await axios.post<AuthResponse>(
      "/api/v1/accounts/resend-otp",
      data
    );
    return response.data;
  },

  // Refreshes the access token using the refresh token
  refreshToken: async (data: RefreshTokenRequest) => {
    const response = await axios.post<TokenResponse>(
      "/api/v1/accounts/refresh",
      data
    );
    const { access, refresh } = response.data.result;

    await setAuthCookies(access, refresh);

    return { access, refresh };
  },

  // Logs out user by invalidating refresh token and clearing cookies
  logout: async () => {
    const refreshToken = Cookies.get(AUTH_TOKEN_NAMES.REFRESH_TOKEN);
    if (!refreshToken) return;

    const data: LogoutRequest = { refresh: refreshToken };
    await axios.post("/api/v1/accounts/logout", data);

    await clearAuthCookies();
    await clearUserRoles();
    return true;
  },

  // Fetches the currently authenticated user's details
  getCurrentUser: async () => {
    const response = await axios.get<UserResponse>("/api/v1/accounts/me");
    return response.data.result;
  },

  // Gets list of roles and permissions assigned to current user
  getUserRoles: async () => {
    const response = await axios.get<RolesResponse>(
      "/api/v1/accounts/me/roles"
    );
    const roles = response.data.result.roles;
    await setUserRoles(roles);
    return roles;
  },

  // Gets list of all system roles
  getAllRoles: async () => {
    const response = await axios.get<RolesResponse>("/api/v1/accounts/roles");
    return response.data.result.roles;
  },

  // Updates the user's profile information
  updateProfile: async (data: FormData) => {
    const response = await axios.patch<UserResponse>(
      "/api/v1/accounts/profile",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.result;
  },

  // Deletes the user's account
  deleteAccount: async (data: DeleteAccountRequest) => {
    const response = await axios.post<AuthResponse>(
      "/api/v1/accounts/delete",
      data
    );

    // Clear cookies on successful deletion
    if (response.data.status === "success") {
      await clearAuthCookies();
    }

    return response.data;
  },
};
