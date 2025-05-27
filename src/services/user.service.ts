import {
  AddEmailRequest,
  AuthResponse,
  DeleteAccountRequest,
  LinkWalletRequest,
  LoginRequest,
  OTPVerificationRequest,
  ResendOtpRequest,
  RoleQueryParams,
  RolesResponse,
  TokenResponse,
  UpdateProfileRequest,
  UserQueryParams,
  UserResponse,
  UsersResponse,
  VerifyEmailRequest,
  VerifyLinkWalletRequest,
  WalletsResponse,
  Web3NonceRequest,
  Web3RecapRequest,
  Web3RecapVerifyRequest,
  Web3VerifyRequest,
} from "@/types/user";

import { apiClient } from "./api.service";

/**
 * User service for handling all user-related operations
 */
class UserService {
  private static instance: UserService;
  private readonly baseUrl = "/api/v1/accounts";

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
    return apiClient.post<TokenResponse>(`${this.baseUrl}/refresh`, { refresh });
  }

  public async logout(refresh: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/logout`, { refresh });
  }

  /**
   * Profile methods
   */
  public async getProfile(): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`${this.baseUrl}/me`);
  }

  public async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(`${this.baseUrl}/profile`, data);
  }

  public async getRoles(): Promise<RolesResponse> {
    return apiClient.get<RolesResponse>(`${this.baseUrl}/me/roles`);
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
  public async getWeb3Nonce(data: Web3NonceRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/nonce`, data);
  }

  public async verifyWeb3Signature(data: Web3VerifyRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/verify`, data);
  }

  public async getWeb3RecapNonce(data: Web3RecapRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/recap-nonce`, data);
  }

  public async verifyWeb3Recap(data: Web3RecapVerifyRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/verify-recap`, data);
  }

  /**
   * Wallet management methods
   */
  public async linkWallet(data: LinkWalletRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/link-wallet`, data);
  }

  public async verifyLinkWallet(data: VerifyLinkWalletRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/verify-link-wallet`, data);
  }

  public async getWallets(): Promise<WalletsResponse> {
    return apiClient.get<WalletsResponse>(`${this.baseUrl}/web3/wallets`);
  }

  /**
   * Email verification methods
   */
  public async addEmail(data: AddEmailRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/add-email`, data);
  }

  public async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.baseUrl}/web3/verify-email`, data);
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
