"use client";

import React, { createContext, useCallback, useContext } from "react";
import { Role, User } from "@/types";
import {
  useLogin,
  useLogout,
  useResendOTP,
  useUpdateProfile,
  useUser,
  useUserRoles,
  useVerifyOTP,
} from "@/lib/hooks/useAuth";

import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  roles: Role[];
  login: (identifier: string) => Promise<void>;
  verifyOTP: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  resendOTP: (identifier: string) => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: roles, isLoading: isRolesLoading } = useUserRoles();
  const loginMutation = useLogin();
  const verifyOTPMutation = useVerifyOTP();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const resendOTPMutation = useResendOTP();
  const [error, setError] = React.useState<string | null>(null);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    setError(error instanceof Error ? error.message : defaultMessage);
  }, []);

  const login = useCallback(
    async (identifier: string) => {
      try {
        setError(null);
        await loginMutation.mutateAsync({ identifier });
      } catch (error) {
        handleError(error, "Login failed");
      }
    },
    [loginMutation, handleError]
  );

  const verifyOTP = useCallback(
    async (identifier: string, otp: string) => {
      try {
        setError(null);
        await verifyOTPMutation.mutateAsync({ identifier, otp });
      } catch (error) {
        handleError(error, "OTP verification failed");
      }
    },
    [verifyOTPMutation, handleError]
  );

  const logout = useCallback(async () => {
    try {
      setError(null);
      await logoutMutation.mutateAsync();
    } catch (error) {
      handleError(error, "Logout failed");
    }
  }, [logoutMutation, handleError]);

  const updateProfile = useCallback(
    async (data: FormData) => {
      try {
        setError(null);
        await updateProfileMutation.mutateAsync(data);
      } catch (error) {
        handleError(error, "Profile update failed");
      }
    },
    [updateProfileMutation, handleError]
  );

  const resendOTP = useCallback(
    async (identifier: string) => {
      try {
        setError(null);
        await resendOTPMutation.mutateAsync({ identifier });
      } catch (error) {
        handleError(error, "OTP resend failed");
      }
    },
    [resendOTPMutation, handleError]
  );

  const contextValue = React.useMemo(
    () => ({
      user: user || null,
      isAuthenticated: !!user,
      isLoading: isUserLoading || isRolesLoading,
      error,
      roles: roles || [],
      login,
      verifyOTP,
      logout,
      resendOTP,
      updateProfile,
    }),
    [
      user,
      isUserLoading,
      isRolesLoading,
      error,
      roles,
      login,
      verifyOTP,
      logout,
      resendOTP,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
