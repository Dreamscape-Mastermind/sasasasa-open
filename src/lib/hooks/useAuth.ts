import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { userApi } from "../api/userApiService";

/**
 * Hook to initiate login by sending identifier (email/phone) to get OTP
 * Returns mutation for handling login request
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: userApi.login,
    onSuccess: () => {
      toast.success("Login initiated. Please check your email for OTP.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate login");
    },
  });
};

/**
 * Hook to verify OTP code and complete login
 * Returns mutation that sets user data in cache on success
 */
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.verifyOTP,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      toast.success("Successfully logged in!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to verify OTP");
    },
  });
};

/**
 * Hook to request a new OTP code be sent
 * Returns mutation for resending OTP
 */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: userApi.resendOTP,
    onSuccess: () => {
      toast.success("OTP has been resent to your email");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    },
  });
};

/**
 * Hook to handle user logout
 * Returns mutation that clears query cache on success
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Successfully logged out");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to logout");
    },
  });
};

/**
 * Hook to fetch current user data
 * Returns query result that only runs when access token exists
 */
export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: userApi.getCurrentUser,
    enabled: !!Cookies.get("accessToken"),
  });
};

/**
 * Hook to fetch current user's roles
 * Returns query result that only runs when access token exists
 */
export const useUserRoles = () => {
  return useQuery({
    queryKey: ["userRoles"],
    queryFn: userApi.getUserRoles,
    enabled: !!Cookies.get("accessToken"),
  });
};

/**
 * Hook to update user profile information
 * Returns mutation that updates user data in cache on success
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
};
