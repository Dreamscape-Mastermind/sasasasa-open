import {
  AddEmailRequest,
  AuthResponse,
  DeleteAccountRequest,
  LinkWalletRequest,
  LinkWalletResponse,
  LoginRequest,
  OTPVerificationRequest,
  ResendOtpRequest,
  RoleQueryParams,
  RolesResponse,
  TokenResponse,
  UserQueryParams,
  UserResponse,
  UsersResponse,
  VerifyEmailRequest,
  VerifyLinkWalletRequest,
  WalletsResponse,
  Web3NonceRequest,
  Web3NonceResponse,
  Web3RecapNonceResponse,
  Web3RecapRequest,
  Web3RecapVerifyRequest,
  Web3RecapVerifyResponse,
  Web3VerifyRequest,
} from "@/types/user";
import { clearUserRoles, getUserRoles, setUserRoles } from "@/lib/constants";

import { UpdateProfileRequest } from "@/types/preferences";
import { apiClient } from "./api.service";

/**
 * User service for handling all user-related operations
 */
class UserService {
  private static instance: UserService;
  private readonly baseUrl = "/api/v1/accounts";
  private readonly web3BaseUrl = "/api/v1/web3";

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Authentication methods
   */
  public async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/login`, data);
  }

  public async resendOtp(data: ResendOtpRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/resend-otp`, data);
  }

  public async verifyOtp(data: OTPVerificationRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/verify-otp`, data);
  }

  public async refreshToken(refresh: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>(`${this.baseUrl}/refresh`, {
      refresh,
    });
  }

  public async logout(refresh: string): Promise<void> {
    // Clear cached roles on logout
    clearUserRoles();
    return apiClient.post(`${this.baseUrl}/logout`, { refresh });
  }

  /**
   * Profile methods
   */
  public async getProfile(): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`${this.baseUrl}/me`);
  }

  public async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(`${this.baseUrl}/profile`, data);
  }

  public async getRoles(): Promise<RolesResponse> {
    const cachedRoles = getUserRoles();
    if (cachedRoles) {
      apiClient
        .get<RolesResponse>(`${this.baseUrl}/me/roles`)
        .then(async (response) => {
          if (response?.result?.roles) {
            await setUserRoles(response.result.roles);
          }
        })
        .catch(() => {});
      return {
        status: "success",
        result: { roles: cachedRoles },
        message: "Roles retrieved from cache",
      };
    }

    const response = await apiClient.get<RolesResponse>(`${this.baseUrl}/me/roles`);
    if (response.result?.roles) {
      await setUserRoles(response.result.roles);
    }
    return response;
  }

  public async refreshRoles(): Promise<RolesResponse> {
    // Clear cached roles and fetch fresh data
    clearUserRoles();
    const response = await apiClient.get<RolesResponse>(
      `${this.baseUrl}/me/roles`
    );

    // Cache the roles if the request was successful
    if (response.result?.roles) {
      await setUserRoles(response.result.roles);
    }

    return response;
  }

  public async listAvailableRoles(): Promise<RolesResponse> {
    return apiClient.get<RolesResponse>(`${this.baseUrl}/roles`);
  }

  public async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    return apiClient.post(`${this.baseUrl}/delete`, data);
  }

  /**
   * Web3 authentication methods
   */
  public async getWeb3Nonce(
    data: Web3NonceRequest
  ): Promise<Web3NonceResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<Web3NonceResponse>('/api/web3/siwe/nonce', data);
    }
    
    return apiClient.post<Web3NonceResponse>(
      `${this.web3BaseUrl}/nonce`,
      data,
      { baseURL: process.env.NEXT_PUBLIC_SASASASA_API_URL }
    );
  }

  private async _getWeb3Nonce(
    data: Web3NonceRequest
  ): Promise<Web3NonceResponse> {
    return apiClient.post<Web3NonceResponse>(`${this.web3BaseUrl}/nonce`, data, {
      baseURL: process.env.NEXT_PUBLIC_SASASASA_API_URL,
    });
  }

  public async verifyWeb3Signature(
    data: Web3VerifyRequest
  ): Promise<AuthResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<AuthResponse>('/api/web3/siwe/verify', data);
    }
    
    return apiClient.post<AuthResponse>(`${this.web3BaseUrl}/verify`, data, {
      baseURL: process.env.NEXT_PUBLIC_SASASASA_API_URL,
    });
  }

  private async _verifyWeb3Signature(
    data: Web3VerifyRequest
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.web3BaseUrl}/verify`, data, {
      baseURL: process.env.NEXT_PUBLIC_SASASASA_API_URL,
    });
  }

  public async getNonce(data: Web3NonceRequest): Promise<Web3NonceResponse> {
    return this._getWeb3Nonce(data);
  }

  public async verifySignature(data: Web3VerifyRequest): Promise<AuthResponse> {
    return this._verifyWeb3Signature(data);
  }

  public async getWeb3RecapNonce(
    data: Web3RecapRequest
  ): Promise<Web3RecapNonceResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<Web3RecapNonceResponse>('/api/web3/recap-nonce', data);
    }
    
    return apiClient.post<Web3RecapNonceResponse>(
      `${this.web3BaseUrl}/recap-nonce`,
      data,
      {
        baseURL: process.env.NEXT_PUBLIC_SASASASA_API_URL,
      }
    );
  }

  public async verifyWeb3Recap(
    data: Web3RecapVerifyRequest
  ): Promise<Web3RecapVerifyResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<Web3RecapVerifyResponse>('/api/web3/verify-recap', data);
    }
    
    return apiClient.post<Web3RecapVerifyResponse>(
      `${this.web3BaseUrl}/verify-recap`,
      data,
      {
        baseURL: process.env.NEXT_PUBLIC_SASASASA_API_URL,
      }
    );
  }

  /**
   * Wallet management methods
   */
  public async linkWallet(
    data: LinkWalletRequest
  ): Promise<LinkWalletResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<LinkWalletResponse>('/api/web3/link-wallet', data);
    }
    
    return apiClient.post<LinkWalletResponse>(
      `${this.web3BaseUrl}/link-wallet`,
      data
    );
  }

  public async verifyLinkWallet(
    data: VerifyLinkWalletRequest
  ): Promise<AuthResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<AuthResponse>('/api/web3/verify-link-wallet', data);
    }
    
    return apiClient.post<AuthResponse>(
      `${this.web3BaseUrl}/verify-link-wallet`,
      data
    );
  }

  public async getWallets(): Promise<WalletsResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.get<WalletsResponse>('/api/web3/wallets');
    }
    
    return apiClient.get<WalletsResponse>(`${this.web3BaseUrl}/wallets`);
  }

  /**
   * Email verification methods
   */
  public async addEmail(data: AddEmailRequest): Promise<AuthResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<AuthResponse>('/api/web3/add-email', data);
    }
    
    return apiClient.post<AuthResponse>(`${this.web3BaseUrl}/add-email`, data);
  }

  public async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    const useProxy = process.env.USE_SIWE_PROXY === 'true';
    
    if (useProxy) {
      return apiClient.post<AuthResponse>('/api/web3/verify-email', data);
    }
    
    return apiClient.post<AuthResponse>(
      `${this.web3BaseUrl}/verify-email`,
      data
    );
  }

  /**
   * Admin methods
   */
  public async listUsers(params?: UserQueryParams): Promise<UsersResponse> {
    return apiClient.get<UsersResponse>(`${this.baseUrl}/users`, { params });
  }

  public async listRoles(params?: RoleQueryParams): Promise<RolesResponse> {
    return apiClient.get<RolesResponse>(`${this.baseUrl}/roles`, { params });
  }
}

export const userService = UserService.getInstance();
