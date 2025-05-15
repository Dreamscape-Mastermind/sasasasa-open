import { AUTH_TOKEN_NAMES, ROUTES } from "../constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { useLogger } from "./useLogger";
import { userApi } from "../api/userApiService";

/**
 * Hook to initiate login by sending identifier (email/phone) to get OTP
 * Returns mutation for handling login request
 */
export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;
  const logger = useLogger({ context: "useLogin" });

  return useMutation({
    mutationFn: (data: { identifier: string }) => userApi.login(data),
    onSuccess: (data, variables) => {
      logger.info("Login initiated successfully", {
        email: variables.identifier,
      });
      trackEvent({
        event: "login_initiated",
        email: variables.identifier,
      });
      toast.success("Login initiated. Please check your email for OTP.");
      router.push(
        `/verify-otp?email=${encodeURIComponent(
          variables.identifier
        )}&redirect=${encodeURIComponent(redirectTo)}`
      );
    },
    onError: (error: any) => {
      logger.error("Login failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      trackEvent({
        event: "login_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;
  const logger = useLogger({ context: "useVerifyOTP" });

  return useMutation({
    mutationFn: (data: { identifier: string; otp: string }) =>
      userApi.verifyOTP(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user"], {
        isAuthenticated: true,
        user: data.user,
      });

      logger.info("OTP verified successfully", { email: variables.identifier });
      trackEvent({
        event: "otp_verified",
        email: variables.identifier,
      });

      router.replace(redirectTo);
      return data;
    },
    onError: (error: any) => {
      // Clear any existing tokens on error
      Cookies.remove(AUTH_TOKEN_NAMES.ACCESS_TOKEN);
      Cookies.remove(AUTH_TOKEN_NAMES.REFRESH_TOKEN);

      // Clear user data from cache
      queryClient.setQueryData(["user"], {
        isAuthenticated: false,
        user: null,
      });

      logger.error("OTP verification failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      trackEvent({
        event: "otp_verification_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error(error?.response?.data?.message || "Failed to verify OTP");
    },
  });
};

/**
 * Hook to request a new OTP code be sent
 * Returns mutation for resending OTP
 */
export const useResendOTP = () => {
  const logger = useLogger({ context: "useResendOTP" });

  return useMutation({
    mutationFn: userApi.resendOTP,
    onSuccess: (_, variables) => {
      logger.info("OTP resent successfully", { email: variables });
      trackEvent({
        event: "otp_resent",
        email: variables,
      });
      toast.success("OTP has been resent to your email");
    },
    onError: (error: any) => {
      logger.error("OTP resend failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      trackEvent({
        event: "otp_resend_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
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
  const logger = useLogger({ context: "useLogout" });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;

  return useMutation({
    mutationFn: userApi.logout,
    onSuccess: (data, variables, context) => {
      const userData = queryClient.getQueryData(["user"]) as
        | { user: { email: string } }
        | undefined;

      queryClient.setQueryData(["user"], {
        isAuthenticated: false,
        user: null,
      });

      queryClient.setQueryData(["user-roles"], []);

      logger.info("User logged out successfully");
      trackEvent({
        event: "user_logged_out",
        user_email: userData?.user?.email,
      });

      toast.success("Successfully logged out");
      router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    },
    onError: (error: any) => {
      logger.error("Logout failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      trackEvent({
        event: "logout_failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
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
    enabled: !!Cookies.get(AUTH_TOKEN_NAMES.ACCESS_TOKEN),
  });
};

/**
 * Hook to fetch current user's roles
 * Returns query result that only runs when access token exists
 */
export const useUserRoles = () => {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: userApi.getUserRoles,
    enabled: !!Cookies.get(AUTH_TOKEN_NAMES.ACCESS_TOKEN),
  });
};

/**
 * Hook to update user profile information
 * Returns mutation that updates user data in cache on success
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => userApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
};
