"use client";

import { createContext, useContext, useEffect } from "react";
import {
  useLogin,
  useLogout,
  useUser,
  useVerifyOTP,
} from "@/lib/hooks/useAuth";

import Cookies from "js-cookie";
import { User } from "@/types/auth";
import { jwtDecode } from "jwt-decode";
import { useLogger } from "@/lib/hooks/useLogger";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (identifier: string) => void;
  verifyOTP: (identifier: string, otp: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const logger = useLogger({ context: "AuthProvider" });
  const { data: user, isLoading } = useUser();
  const { mutate: loginMutation } = useLogin();
  const { mutate: verifyOTPMutation } = useVerifyOTP();
  const { mutate: logoutMutation } = useLogout();

  // Check token validity on mount
  useEffect(() => {
    const checkTokenValidity = () => {
      try {
        const accessToken = Cookies.get("accessToken");

        if (!accessToken) {
          logger.info("No access token found");
          return;
        }

        // Decode token to check expiration
        const decodedToken = jwtDecode(accessToken) as { exp: number };
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          logger.warn("Token expired, logging out user", {
            userId: user?.id,
            expiredAt: new Date(decodedToken.exp * 1000).toISOString(),
          });

          // Clear tokens and redirect
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          logoutMutation(undefined, {
            onSuccess: () => {
              router.push("/login");
            },
          });
        } else {
          logger.info("Token is valid", {
            userId: user?.id,
            expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
          });
        }
      } catch (error) {
        logger.error("Error checking token validity", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Clear invalid tokens
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        router.push("/login");
      }
    };

    checkTokenValidity();
  }, [user, logoutMutation, router, logger]);

  const login = (identifier: string) => {
    logger.info("Login initiated", { identifier });
    loginMutation({ identifier });
  };

  const verifyOTP = (identifier: string, otp: string) => {
    logger.info("OTP verification initiated", { identifier });
    verifyOTPMutation({ identifier, otp });
  };

  const logout = () => {
    logger.info("Logout initiated");
    logoutMutation(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        login,
        verifyOTP,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
