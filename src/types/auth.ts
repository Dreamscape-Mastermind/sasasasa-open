import { ApiResponse, SocialMediaUrls } from "./common";

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
  phone?: string;
  is_verified: boolean;
  profile: UserProfile;
  social_media: SocialMediaUrls;
  user_preferences: UserPreferences;
}

export interface Role {
  id: number;
  name: string;
  permissions_list: string[];
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
  profile?: Partial<UserProfile>;
  social_media?: Partial<SocialMediaUrls>;
  user_preferences?: Partial<UserPreferences>;
}

export interface ErrorResponse {
  status: "error";
  message: string;
  result?: {
    errors?: Record<string, string[]>;
  };
}
