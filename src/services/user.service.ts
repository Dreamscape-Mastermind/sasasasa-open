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
  private readonly siweBaseUrl = "/api/web3/siwe";

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
    // Check if roles are cached in localStorage
    const cachedRoles = getUserRoles();
    if (cachedRoles) {
      return {
        status: "success",
        result: {
          roles: cachedRoles,
        },
        message: "Roles retrieved from cache",
      };
    }

    // If not cached, fetch from API
    const response = await apiClient.get<RolesResponse>(
      `${this.baseUrl}/me/roles`
    );

    // Cache the roles if the request was successful
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
    return apiClient.post<Web3NonceResponse>(
      `${this.siweBaseUrl}/nonce`,
      data,
      { baseURL: process.env.NEXT_PUBLIC_APP_URL }
    );
  }

  private async _getWeb3Nonce(
    data: Web3NonceRequest
  ): Promise<Web3NonceResponse> {
    return apiClient.post<Web3NonceResponse>(`${this.web3BaseUrl}/nonce`, data);
  }

  public async verifyWeb3Signature(
    data: Web3VerifyRequest
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.siweBaseUrl}/verify`, data, {
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
    });
  }

  private async _verifyWeb3Signature(
    data: Web3VerifyRequest
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.web3BaseUrl}/verify`, data);
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
    return apiClient.post<Web3RecapNonceResponse>(
      `${this.web3BaseUrl}/recap-nonce`,
      data
    );
  }

  public async verifyWeb3Recap(
    data: Web3RecapVerifyRequest
  ): Promise<Web3RecapVerifyResponse> {
    return apiClient.post<Web3RecapVerifyResponse>(
      `${this.web3BaseUrl}/verify-recap`,
      data
    );
  }

  /**
   * Wallet management methods
   */
  public async linkWallet(
    data: LinkWalletRequest
  ): Promise<LinkWalletResponse> {
    return apiClient.post<LinkWalletResponse>(
      `${this.web3BaseUrl}/link-wallet`,
      data
    );
  }

  public async verifyLinkWallet(
    data: VerifyLinkWalletRequest
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      `${this.web3BaseUrl}/verify-link-wallet`,
      data
    );
  }

  public async getWallets(): Promise<WalletsResponse> {
    return apiClient.get<WalletsResponse>(`${this.web3BaseUrl}/wallets`);
  }

  /**
   * Email verification methods
   */
  public async addEmail(data: AddEmailRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.web3BaseUrl}/add-email`, data);
  }

  public async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
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
