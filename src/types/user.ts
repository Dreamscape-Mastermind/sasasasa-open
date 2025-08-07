import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

import { NotificationSettings } from "./preferences";

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/**
 * Base interfaces
 */
export interface BaseUserEntity extends TimeStamp {
  id: string;
}

/**
 * Core interfaces
 */
export interface UserProfile extends BaseUserEntity {
  email: Nullable<string>;
  phone: Nullable<string>;
  first_name: string;
  last_name: string;
  avatar: Nullable<string>;
  bio: Nullable<string>;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  preferences: Nullable<Record<string, any>>;
  notification_settings: Nullable<NotificationSettings>;
  instagram_handle: Nullable<string>;
  twitter_handle: Nullable<string>;
  linkedin_handle: Nullable<string>;
  tiktok_handle: Nullable<string>;
  youtube_handle: Nullable<string>;
  website: Nullable<string>;
  timezone: Nullable<string>;
  last_online_at: Nullable<string>;
  primary_wallet: Nullable<WalletInfo>;
  wallets: WalletInfo[];
  walletAddress?: Nullable<string>;
  authType: "web2" | "web3";
  beta?: boolean;
}

/**
 * Wallet types
 */
export interface WalletInfo extends BaseUserEntity {
  last_used?: string;
  is_primary?: boolean;
  address: string;
  chain_id: number;
  is_verified?: boolean;
}

export interface WalletLimitedInfo {
  address: string;
  chain_id: number;
  is_verified: boolean;
}

/**
 * Role types
 */
export interface Role {
  id: number;
  name: string;
  permissions_list: string[];
  description: string;
}

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EVENT_ORGANIZER = "EVENT_ORGANIZER",
  EVENT_TEAM = "EVENT_TEAM",
  CUSTOMER = "CUSTOMER",
  BETA_TESTER = "BETA_TESTER",
}

/**
 * Authentication types
 */
export interface LoginRequest {
  identifier: string;
}

export interface ResendOtpRequest {
  identifier: string;
}

export interface OTPVerificationRequest {
  identifier: string;
  otp: string;
}

export interface TokenResponse
  extends SuccessResponse<{
    access: string;
    refresh: string;
  }> {}

export interface AuthResponse
  extends SuccessResponse<{
    tokens: TokenResponse;
    user: UserProfile;
    requires_email?: boolean;
  }> {}
/**
 * Web3 authentication types
 */
export interface Web3NonceRequest {
  address: string;
  chain_id?: number;
}

export interface Web3NonceResponse
  extends SuccessResponse<{
    message_data: {
      domain: string;
      address: string;
      statement: string;
      uri: string;
      version: string;
      chain_id: number;
      nonce: string;
      issued_at: string;
    };
    message: string;
  }> {}

export interface Web3VerifyRequest {
  message_data: {
    domain: string;
    address: string;
    statement: string;
    uri: string;
    version: string;
    chain_id: number;
    nonce: string;
    issued_at: string;
  };
  signature: string;
}

export interface Web3RecapRequest extends Web3NonceRequest {
  capabilities: Record<string, any>;
}

export interface Web3RecapVerifyRequest {
  message_data: {
    domain: string;
    address: string;
    statement: string;
    uri: string;
    version: string;
    chain_id: number;
    nonce: string;
    issued_at: string;
  };
  signature: string;
  recap_data: string;
}

export interface Web3RecapNonceResponse
  extends SuccessResponse<{
    message_data: {
      domain: string;
      address: string;
      statement: string;
      uri: string;
      version: string;
      chain_id: number;
      nonce: string;
      issued_at: string;
    };
    message: string;
    recap_data: string;
  }> {}

export interface Web3RecapVerifyResponse
  extends SuccessResponse<{
    tokens: TokenResponse;
    user: UserProfile;
    requires_email?: boolean;
    capabilities?: Record<string, any>;
  }> {}

/**
 * Account management types
 */
export interface DeleteAccountRequest {
  confirmation_text: string;
}

export interface AddEmailRequest {
  email: string;
}

export interface VerifyEmailRequest {
  otp: string;
}

export interface LinkWalletRequest {
  address: string;
  chain_id?: number;
}

export interface LinkWalletResponse
  extends SuccessResponse<{
    message_data: {
      domain: string;
      address: string;
      statement: string;
      uri: string;
      version: string;
      chain_id: number;
      nonce: string;
      issued_at: string;
    };
    message: string;
  }> {}

export interface VerifyLinkWalletRequest {
  message_data: {
    domain: string;
    address: string;
    statement: string;
    uri: string;
    version: string;
    chain_id: number;
    nonce: string;
    issued_at: string;
  };
  signature: string;
}

/**
 * Response interfaces
 */
export interface UserResponse extends SuccessResponse<UserProfile> {}

export interface UsersResponse
  extends SuccessResponse<PaginatedResponse<UserProfile>> {}

export interface UserProfileResponse extends SuccessResponse<UserProfile> {}

export interface UserProfilesResponse
  extends SuccessResponse<PaginatedResponse<UserProfile>> {}

export interface UserPreferencesResponse
  extends SuccessResponse<NotificationSettings> {}

export interface UserAnalyticsResponse
  extends SuccessResponse<{
    total_users: number;
    active_users: number;
    new_users_by_date: Record<string, number>;
    user_roles_distribution: Record<string, number>;
  }> {}

export interface RolesResponse
  extends SuccessResponse<{
    roles?: Role[];
  }> {}

export interface WalletsResponse
  extends SuccessResponse<{
    primary_wallet: Nullable<WalletInfo>;
    wallets: WalletInfo[];
  }> {}

/**
 * Query parameter interfaces
 */
export interface UserQueryParams {
  search?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_staff?: boolean;
  ordering?: string;
  page?: number;
}

export interface RoleQueryParams {
  search?: string;
  ordering?: string;
  page?: number;
}
