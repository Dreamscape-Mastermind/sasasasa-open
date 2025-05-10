"use client";

import React, { createContext, useContext, useEffect } from "react";
import { Role, User } from "@/types";
import { setUserRoles } from "@/lib/auth";
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

  // Update roles in localStorage when they change
  useEffect(() => {
    if (roles) {
      setUserRoles(roles);
    }
  }, [roles]);

  const login = async (identifier: string) => {
    try {
      setError(null);
      await loginMutation.mutateAsync({ identifier });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const verifyOTP = async (identifier: string, otp: string) => {
    try {
      setError(null);
      await verifyOTPMutation.mutateAsync({ identifier, otp });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "OTP verification failed"
      );
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await logoutMutation.mutateAsync();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout failed");
    }
  };

  const updateProfile = async (data: FormData) => {
    try {
      setError(null);
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Profile update failed"
      );
    }
  };

  const resendOTP = async (identifier: string) => {
    try {
      setError(null);
      await resendOTPMutation.mutateAsync({ identifier });
    } catch (error) {
      setError(error instanceof Error ? error.message : "OTP resend failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
