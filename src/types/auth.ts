import { ApiResponse } from "./common";

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
}

export interface UserPreferences {
  preferences?: {
    theme?: string;
    language?: string;
    [key: string]: any;
  };
  notification_settings?: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    [key: string]: any;
  };
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  is_verified: boolean;
  avatar: string | null;
  bio: string | null;
  preferences: any | null;
  notification_settings: any | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  linkedin_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  website: string | null;
}

export interface Role {
  id: number;
  name: string;
  permissions_list: string[];
}

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EVENT_ORGANIZER = "EVENT_ORGANIZER",
  EVENT_TEAM = "EVENT_TEAM",
  CUSTOMER = "CUSTOMER",
}

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  result: {
    user: User;
    tokens: {
      refresh: string;
      access: string;
    };
  };
}

export interface TokenResponse {
  status: "success" | "error";
  message: string;
  result: {
    access: string;
    refresh: string;
  };
}

export interface UserResponse {
  status: "success" | "error";
  message: string;
  result: User;
}

export interface RolesResponse
  extends ApiResponse<{
    roles: Role[];
  }> {}

export interface LoginRequest {
  identifier: string;
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface DeleteAccountRequest {
  identifier: string;
  confirmation_text: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  instagram_handle?: string;
  twitter_handle?: string;
  linkedin_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string;
  website?: string;
}

export interface ErrorResponse {
  status: "error";
  message: string;
  result?: {
    errors?: Record<string, string[]>;
  };
}
