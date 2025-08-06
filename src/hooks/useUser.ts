import type {
  AddEmailRequest,
  DeleteAccountRequest,
  LinkWalletRequest,
  LoginRequest,
  OTPVerificationRequest,
  ResendOtpRequest,
  RoleQueryParams,
  UserQueryParams,
  VerifyEmailRequest,
  VerifyLinkWalletRequest,
  Web3NonceRequest,
  Web3RecapRequest,
  Web3RecapVerifyRequest,
  Web3VerifyRequest,
} from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UpdateProfileRequest } from "@/types/preferences";
import { userService } from "@/services/user.service";

export const useUser = () => {
  const queryClient = useQueryClient();

  // Authentication
  const useLogin = () => {
    return useMutation({
      mutationFn: (data: LoginRequest) => userService.login(data),
    });
  };

  const useResendOtp = () => {
    return useMutation({
      mutationFn: (data: ResendOtpRequest) => userService.resendOtp(data),
    });
  };

  const useVerifyOtp = () => {
    return useMutation({
      mutationFn: (data: OTPVerificationRequest) => userService.verifyOtp(data),
    });
  };

  const useRefreshToken = () => {
    return useMutation({
      mutationFn: (refresh: string) => userService.refreshToken(refresh),
    });
  };

  const useLogout = () => {
    return useMutation({
      mutationFn: (refresh: string) => userService.logout(refresh),
      onSuccess: () => {
        queryClient.clear();
      },
    });
  };

  // Profile
  const useProfile = () => {
    return useQuery({
      queryKey: ["profile"],
      queryFn: () => userService.getProfile(),
    });
  };

  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: (data: UpdateProfileRequest) =>
        userService.updateProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  const useRoles = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ["roles"],
      queryFn: () => userService.getRoles(),
      enabled: options?.enabled ?? true,
      staleTime: 30 * 60 * 1000, // 30 minutes - increased from 5 minutes
      gcTime: 60 * 60 * 1000, // 1 hour - increased from default
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (rate limit) or 4xx errors
        if (
          error?.response?.status === 429 ||
          (error?.response?.status >= 400 && error?.response?.status < 500)
        ) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Shorter backoff
    });
  };

  const useRefreshRoles = () => {
    return useMutation({
      mutationFn: () => userService.refreshRoles(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
      },
    });
  };

  const useAvailableRoles = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ["available-roles"],
      queryFn: () => userService.listAvailableRoles(),
      enabled: options?.enabled ?? true,
      staleTime: 60 * 60 * 1000, // 1 hour - roles don't change often
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (rate limit) or 4xx errors
        if (
          error?.response?.status === 429 ||
          (error?.response?.status >= 400 && error?.response?.status < 500)
        ) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Shorter backoff
    });
  };

  const useDeleteAccount = () => {
    return useMutation({
      mutationFn: (data: DeleteAccountRequest) =>
        userService.deleteAccount(data),
      onSuccess: () => {
        queryClient.clear();
      },
    });
  };

  // Web3 Authentication
  const useWeb3Nonce = () => {
    return useMutation({
      mutationFn: (data: Web3NonceRequest) => userService.getWeb3Nonce(data),
    });
  };

  const useVerifyWeb3Signature = () => {
    return useMutation({
      mutationFn: (data: Web3VerifyRequest) =>
        userService.verifyWeb3Signature(data),
    });
  };

  const useLoginWithSIWE = () => {
    return useMutation({
      mutationFn: async (address: string) => {
        // First get nonce
        const nonceResponse = await userService.getWeb3Nonce({ address });
        return { address, nonceResponse };
      },
    });
  };

  const useWeb3RecapNonce = () => {
    return useMutation({
      mutationFn: (data: Web3RecapRequest) =>
        userService.getWeb3RecapNonce(data),
    });
  };

  const useVerifyWeb3Recap = () => {
    return useMutation({
      mutationFn: (data: Web3RecapVerifyRequest) =>
        userService.verifyWeb3Recap(data),
    });
  };

  // Wallet Management
  const useLinkWallet = () => {
    return useMutation({
      mutationFn: (data: LinkWalletRequest) => userService.linkWallet(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  const useVerifyLinkWallet = () => {
    return useMutation({
      mutationFn: (data: VerifyLinkWalletRequest) =>
        userService.verifyLinkWallet(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  const useWallets = () => {
    return useQuery({
      queryKey: ["wallets"],
      queryFn: () => userService.getWallets(),
    });
  };

  // Email Verification
  const useAddEmail = () => {
    return useMutation({
      mutationFn: (data: AddEmailRequest) => userService.addEmail(data),
    });
  };

  const useVerifyEmail = () => {
    return useMutation({
      mutationFn: (data: VerifyEmailRequest) => userService.verifyEmail(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      },
    });
  };

  // Admin
  const useUsers = (params?: UserQueryParams) => {
    return useQuery({
      queryKey: ["users", params],
      queryFn: () => userService.listUsers(params),
    });
  };

  const useListRoles = (params?: RoleQueryParams) => {
    return useQuery({
      queryKey: ["list-roles", params],
      queryFn: () => userService.listRoles(params),
    });
  };

  return {
    // Authentication
    useLogin,
    useResendOtp,
    useVerifyOtp,
    useRefreshToken,
    useLogout,
    // Profile
    useProfile,
    useUpdateProfile,
    useRoles,
    useRefreshRoles,
    useAvailableRoles,
    useDeleteAccount,
    // Web3 Authentication
    useWeb3Nonce,
    useVerifyWeb3Signature,
    useLoginWithSIWE,
    useWeb3RecapNonce,
    useVerifyWeb3Recap,
    // Wallet Management
    useLinkWallet,
    useVerifyLinkWallet,
    useWallets,
    // Email Verification
    useAddEmail,
    useVerifyEmail,
    // Admin
    useUsers,
    useListRoles,
  };
};
