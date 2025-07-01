"use client";

import { ACCESS_LEVELS, ROUTES } from "@/lib/constants";
import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from "ethers";
import {
  LoginRequest,
  ResendOtpRequest,
  TokenResponse,
  UserProfile,
  UserRole,
  Web3RecapRequest,
  Web3RecapVerifyRequest,
  Web3RecapVerifyResponse,
} from "@/types/user";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useAppKitAccount,
  useAppKitNetworkCore,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Role } from "../types";
import { cookieService } from "@/services/cookie.service";
import { routeService } from "@/services/route.service";
import toast from "react-hot-toast";
import { tokenService } from "@/services/token.service";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { useUser } from "@/hooks/useUser";

type AccessLevel = (typeof ACCESS_LEVELS)[keyof typeof ACCESS_LEVELS];

interface AuthContextType {
  user: UserProfile | null;
  roles: Role[] | null;
  availableRoles: Role[] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (data: LoginRequest) => Promise<boolean>;
  completeOtpVerification: (data: any) => Promise<boolean>;
  resendOtp: (data: ResendOtpRequest) => Promise<boolean>;
  loginWithWallet: (address: `0x${string}`) => Promise<boolean>;
  loginWithSIWEReCap: (
    address: `0x${string}`,
    capabilities?: Record<string, any>
  ) => Promise<boolean>;
  linkWallet: (address: `0x${string}`) => Promise<boolean>;
  logout: () => void;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<void>;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  hasAccessLevel: (level: AccessLevel) => boolean;
  hasAnyAccessLevel: (levels: AccessLevel[]) => boolean;
  hasAllAccessLevels: (levels: AccessLevel[]) => boolean;
  /**
   * Directly set the user in context. Use after profile update for instant UI refresh.
   */
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetworkCore();
  const { walletProvider } = useAppKitProvider("eip155");
  const { disconnect } = useDisconnect();

  const analytics = useAnalytics();
  const logger = useLogger({ context: "Auth" });

  const {
    useLogin,
    useRefreshToken,
    useLogout,
    useWeb3Nonce,
    useVerifyWeb3Signature,
    useWeb3RecapNonce,
    useVerifyWeb3Recap,
    useLinkWallet,
    useVerifyLinkWallet,
    useVerifyOtp,
    useResendOtp,
    useRoles,
    useAvailableRoles,
  } = useUser();

  // Initialize mutations and queries
  const loginMutation = useLogin();
  const refreshTokenMutation = useRefreshToken();
  const logoutMutation = useLogout();
  const web3NonceMutation = useWeb3Nonce();
  const verifyWeb3SignatureMutation = useVerifyWeb3Signature();
  const web3RecapNonceMutation = useWeb3RecapNonce();
  const verifyWeb3RecapMutation = useVerifyWeb3Recap();
  const linkWalletMutation = useLinkWallet();
  const verifyLinkWalletMutation = useVerifyLinkWallet();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  // Role queries - only run when authenticated
  const { data: rolesData } = useRoles({
    enabled: isAuthenticated && !!tokens?.result?.access,
  });
  const { data: availableRolesData } = useAvailableRoles({
    enabled: isAuthenticated && !!tokens?.result?.access,
  });

  // Role helper functions
  /**
   * Check if user has a specific role
   * @param roleName - The name of the role to check for
   * @returns True if the user has the role, false otherwise
   */
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!rolesData?.result?.roles) return false;
      return rolesData.result?.roles.some((role) => role.name === roleName);
    },
    [rolesData]
  );

  /**
   * Check if user has any of the specified roles
   * @param roleNames - An array of role names to check for
   * @returns True if the user has any of the roles, false otherwise
   */
  const hasAnyRole = useCallback(
    (roleNames: string[]): boolean => {
      if (!rolesData?.result?.roles) return false;
      return rolesData.result?.roles.some((role) =>
        roleNames.includes(role.name)
      );
    },
    [rolesData]
  );

  /**
   * Check if user has all of the specified roles
   * @param roleNames - An array of role names to check for
   * @returns True if the user has all of the roles, false otherwise
   */
  const hasAllRoles = useCallback(
    (roleNames: string[]): boolean => {
      if (!rolesData?.result?.roles) return false;
      return roleNames.every((roleName) =>
        rolesData.result?.roles?.some((role) => role.name === roleName)
      );
    },
    [rolesData]
  );

  // Access level helper functions
  /**
   * Check if user has a specific access level
   * @param level - The access level to check for
   * @returns True if the user has the access level, false otherwise
   */
  const hasAccessLevel = useCallback(
    (level: AccessLevel): boolean => {
      if (!rolesData?.result) return false;

      switch (level) {
        case ACCESS_LEVELS.PUBLIC:
          return true;
        case ACCESS_LEVELS.AUTHENTICATED:
          return isAuthenticated;
        case ACCESS_LEVELS.ADMIN:
          return hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);
        case ACCESS_LEVELS.EVENT_ORGANIZER:
          return hasRole(UserRole.EVENT_ORGANIZER);
        case ACCESS_LEVELS.EVENT_TEAM:
          return hasRole(UserRole.EVENT_TEAM);
        case ACCESS_LEVELS.CUSTOMER:
          return hasRole(UserRole.CUSTOMER);
        default:
          return false;
      }
    },
    [rolesData, isAuthenticated, hasRole]
  );

  const hasAnyAccessLevel = useCallback(
    (levels: AccessLevel[]): boolean => {
      return levels.some((level) => hasAccessLevel(level));
    },
    [hasAccessLevel]
  );

  const hasAllAccessLevels = useCallback(
    (levels: AccessLevel[]): boolean => {
      return levels.every((level) => hasAccessLevel(level));
    },
    [hasAccessLevel]
  );

  const handleSignMsg = async (message: any, address: string) => {
    const provider = new BrowserProvider(
      walletProvider as Eip1193Provider,
      chainId
    );
    const signer = new JsonRpcSigner(provider, address);
    return await signer?.signMessage(message);
  };

  // Route protection with access levels
  useEffect(() => {
    // let timeoutId: NodeJS.Timeout;

    const handleRouteCheck = () => {
      const path = window.location.pathname;
      if (isLoading) return;

      const category = routeService.getRouteCategory(path);

      // Check access level requirements
      if (category === "PROTECTED") {
        if (!isAuthenticated) {
          router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`);
          return;
        }

        // Check specific route access levels
        if (
          path.startsWith(ROUTES.DASHBOARD_BLOG) &&
          !hasAccessLevel(ACCESS_LEVELS.ADMIN)
        ) {
          router.push(ROUTES.UNAUTHORIZED);
          return;
        }
      }

      const redirectPath = routeService.getRedirectPath(path, isAuthenticated);
      if (redirectPath) {
        router.push(redirectPath);
      }
    };

    // const debouncedRouteCheck = () => {
    //   clearTimeout(timeoutId);
    //   timeoutId = setTimeout(handleRouteCheck, 100);
    // };

    handleRouteCheck();
    window.addEventListener("popstate", handleRouteCheck);

    return () => {
      // clearTimeout(timeoutId);
      window.removeEventListener("popstate", handleRouteCheck);
    };
  }, [isAuthenticated, isLoading, router, hasAccessLevel, hasAnyAccessLevel]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = cookieService.getUser();
        const storedTokens = cookieService.getTokens();

        if (storedUser && storedTokens?.result) {
          if (tokenService.validateToken(storedTokens?.result?.access)) {
            setUser(storedUser);
            setTokens(storedTokens);
            setIsAuthenticated(true);
            logger.info("User session restored", { userId: storedUser.id });
            analytics.trackUserAction("session_restored", "auth");
          } else {
            logger.warn("Invalid token found during initialization");
            await logout();
          }
        }
      } catch (error) {
        logger.error("Auth initialization error", error);
        analytics.trackError(error as Error, {
          context: "auth_initialization",
        });
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Monitor wallet connection
  useEffect(() => {
    if (isConnected && address && !user) {
      // Auto-login with wallet if connected
      // loginWithWallet(address)
    } else if (!isConnected && user?.authType === "web3") {
      logout();
    }
  }, [isConnected, address]);

  // Token refresh interval
  useEffect(() => {
    if (tokens?.result?.access) {
      const timeUntilExpiration = tokenService.getTimeUntilExpiration(
        tokens.result.access
      );
      if (timeUntilExpiration) {
        const refreshInterval = setInterval(() => {
          refreshAccessToken();
        }, Math.max(0, timeUntilExpiration - 10 * 60 * 1000)); // Refresh 10 minutes before expiry

        return () => clearInterval(refreshInterval);
      }
    }
  }, [tokens]);

  const logout = async () => {
    if (tokens) {
      try {
        await logoutMutation.mutateAsync(tokens?.result?.refresh || "");
        logger.info("User logged out successfully", { userId: user?.id });
        analytics.trackUserAction("logout", "auth");
        cookieService.clearAuth();
      } catch (error) {
        logger.error("Logout error", error);
        analytics.trackError(error as Error, { context: "logout" });
      }
    }

    setUser(null);
    setTokens(null);
    cookieService.clearAuth();
    tokenService.clearCache();
    disconnect();
    router.push(ROUTES.HOME);
  };

  const getAccessToken = useCallback((): string | null => {
    const storedTokens = cookieService.getTokens();
    if (!storedTokens) return null;

    return tokenService.validateToken(storedTokens?.result?.access ?? "")
      ? storedTokens?.result?.access ?? null
      : null;
  }, []);

  const refreshAccessToken = async () => {
    if (!tokens?.result?.refresh) return;

    try {
      const response = await refreshTokenMutation.mutateAsync(
        tokens.result.refresh
      );
      const newTokens: TokenResponse = {
        status: "success",
        message: "Token refreshed successfully",
        result: {
          access: response.result?.access || "",
          refresh: tokens.result.refresh,
        },
      };
      setTokens(newTokens);
      cookieService.setTokens(newTokens);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  const loginWithSIWEReCap = async (
    address: `0x${string}`,
    capabilities?: Record<string, any>
  ) => {
    try {
      logger.info("Attempting SIWE with ReCap", { address });
      const nonceResponse = await web3RecapNonceMutation.mutateAsync({
        address,
        capabilities,
      } as Web3RecapRequest);

      if (!nonceResponse.result) {
        throw new Error("Failed to get nonce response");
      }

      const { message_data, message, recap_data } = nonceResponse.result;

      const signature = await handleSignMsg(message, address);

      const verifyResponse = await verifyWeb3RecapMutation.mutateAsync({
        message_data,
        signature,
        recap_data,
      } as Web3RecapVerifyRequest);

      if (verifyResponse.result) {
        const { tokens: newTokens, user: newUser } =
          verifyResponse.result as NonNullable<
            Web3RecapVerifyResponse["result"]
          >;

        setTokens(newTokens);
        cookieService.setTokens(newTokens);

        // Update user profile with wallet info
        const walletUser: UserProfile = {
          ...newUser,
          primary_wallet: {
            id: address,
            address: address,
            chain_id: chainId as number,
            is_verified: true,
            last_used: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          wallets: [
            {
              id: address,
              address: address,
              chain_id: chainId as number,
              is_verified: true,
              last_used: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        };

        setUser(walletUser);
        cookieService.setUser(walletUser);

        logger.info("SIWE with ReCap successful", {
          userId: newUser.id,
          address,
        });
        analytics.trackUserAction("login_completed", "auth", "wallet");

        if (verifyResponse.result.requires_email) {
          router.push(
            `${ROUTES.DASHBOARD_SETTINGS}?tab=account&action=link-email`
          );
        } else {
          toast.success("Signed in via Wallet");
          router.push(ROUTES.DASHBOARD);
        }

        return true;
      }

      logger.warn("SIWE with ReCap failed", { address });
      toast.error("Failed to authenticate wallet");
      return false;
    } catch (error) {
      logger.error("SIWE with ReCap error", error);
      analytics.trackError(error as Error, { context: "siwe_recap" });
      toast.error("Authentication failed");
      return false;
    }
  };

  const loginWithWallet = async (address: `0x${string}`) => {
    try {
      logger.info("Attempting SIWE login", { address });

      // Get nonce from server
      const nonceResponse = await web3NonceMutation.mutateAsync({ address });

      if (!nonceResponse.result) {
        throw new Error("Failed to get nonce response");
      }

      const { message_data, message } = nonceResponse.result;

      // Sign message with wallet
      const signature = await handleSignMsg(message, address);

      // Verify signature
      const verifyResponse = await verifyWeb3SignatureMutation.mutateAsync({
        message_data,
        signature,
      });

      if (verifyResponse.result) {
        const { tokens: newTokens, user: newUser } = verifyResponse.result;

        setTokens(newTokens);
        cookieService.setTokens(newTokens);

        // Update user profile with wallet info
        const walletUser: UserProfile = {
          ...newUser,
          primary_wallet: {
            id: address,
            address: address,
            chain_id: chainId as number,
            is_verified: true,
            last_used: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          wallets: [
            {
              id: address,
              address: address,
              chain_id: chainId as number,
              is_verified: true,
              last_used: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        };

        setUser(walletUser);
        cookieService.setUser(walletUser);
        setIsAuthenticated(true);

        logger.info("SIWE login successful", {
          userId: newUser.id,
          address,
        });
        analytics.trackUserAction("login_completed", "auth", "wallet");

        if (verifyResponse.result.requires_email) {
          router.push(
            `${ROUTES.DASHBOARD_SETTINGS}?tab=account&action=link-email`
          );
        } else {
          toast.success("Signed in via Wallet");
          router.push(ROUTES.DASHBOARD);
        }

        return true;
      }

      logger.warn("SIWE login failed", { address });
      toast.error("Failed to authenticate wallet");
      return false;
    } catch (error) {
      logger.error("SIWE login error", error);
      analytics.trackError(error as Error, { context: "siwe_login" });
      toast.error("Authentication failed");
      return false;
    }
  };

  const linkWallet = async (address: `0x${string}`) => {
    try {
      if (!user || !getAccessToken()) {
        toast.error("You must be logged in to link a wallet");
        return false;
      }

      const linkResponse = await linkWalletMutation.mutateAsync({
        address,
        chain_id: Number(chainId),
      });

      if (!linkResponse.result) {
        toast.error("Failed to get linking data");
        return false;
      }

      const { message_data, message } = linkResponse.result;

      const signature = await handleSignMsg(message, address);

      const verifyResponse = await verifyLinkWalletMutation.mutateAsync({
        message_data,
        signature,
      });

      if (verifyResponse.result) {
        toast.success("Wallet linked successfully");
        return true;
      }

      toast.error("Failed to link wallet");
      return false;
    } catch (error) {
      console.error("Wallet linking error:", error);
      toast.error("Failed to link wallet");
      return false;
    }
  };

  const loginWithEmail = async (data: LoginRequest): Promise<boolean> => {
    try {
      logger.info("Attempting email login", { email: data.identifier });
      const response = await loginMutation.mutateAsync(data);

      if (response.result) {
        toast.success("OTP sent to your email");
        analytics.trackUserAction("login_initiated", "auth", "email");
        router.push(
          `${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(
            data.identifier
          )}&type=login&redirect=${encodeURIComponent(redirectTo)}`
        );
        return true;
      }

      logger.warn("Login failed", { email: data.identifier });
      toast.error("Login failed");
      return false;
    } catch (error) {
      logger.error("Login error", error);
      analytics.trackError(error as Error, { context: "email_login" });
      toast.error("Login failed");
      return false;
    }
  };

  const completeOtpVerification = async (response: {
    result: {
      tokens: TokenResponse;
      user: UserProfile;
    };
  }): Promise<boolean> => {
    try {
      if (response.result) {
        const { tokens: newTokens, user: newUser } = response.result;

        setUser(newUser);
        setTokens(newTokens);
        setIsAuthenticated(true);

        cookieService.setUser(newUser);
        cookieService.setTokens(newTokens);

        logger.info("OTP verification successful", { userId: newUser.id });
        analytics.trackUserAction("login_completed", "auth", "email");
        return true;
      }

      logger.warn("OTP verification failed", { email: user?.email });
      toast.error("OTP verification failed");
      return false;
    } catch (error) {
      logger.error("OTP verification error", error);
      analytics.trackError(error as Error, { context: "otp_verification" });
      toast.error("OTP verification failed");
      return false;
    }
  };

  const resendOtp = async (data: ResendOtpRequest): Promise<boolean> => {
    try {
      logger.info("Attempting to resend OTP", { email: data.identifier });
      const response = await resendOtpMutation.mutateAsync(data);

      if (response.result) {
        logger.info("OTP resent successfully", { email: data.identifier });
        analytics.trackUserAction("otp_resent", "auth");
        toast.success("OTP resent successfully");
        router.push(
          `${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(
            data.identifier
          )}&type=login&redirect=${encodeURIComponent(redirectTo)}`
        );
        return true;
      }

      logger.warn("Failed to resend OTP", { email: data.identifier });
      toast.error("Failed to resend OTP");
      return false;
    } catch (error) {
      logger.error("Resend OTP error", error);
      analytics.trackError(error as Error, { context: "resend_otp" });
      toast.error("Failed to resend OTP");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles: rolesData?.result?.roles || null,
        availableRoles: availableRolesData?.result?.roles || null,
        isLoading,
        isAuthenticated: !!user,
        loginWithEmail,
        completeOtpVerification,
        resendOtp,
        loginWithWallet,
        loginWithSIWEReCap,
        linkWallet,
        logout,
        getAccessToken,
        refreshAccessToken,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        hasAccessLevel,
        hasAnyAccessLevel,
        hasAllAccessLevels,
        setUser,
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
