import { Nullable, PaginatedResponse, SuccessResponse, TimeStamp } from "./common";

// Gender enum
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export interface ConsentPreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export interface ConsentData {
  preferences: ConsentPreferences;
  version: string;
  timestamp: number;
  granted_at: string;
}

export interface ConsentResponse {
  consent: ConsentData | null;
}

export interface UpdateConsentRequest {
  preferences: ConsentPreferences;
  version?: string;
}

// Base profile interface (public fields)
export interface BaseProfile extends TimeStamp {
  id: string;
  bio: Nullable<string>;
  avatar: Nullable<string>;
  location: Nullable<string>;
  instagram_handle: Nullable<string>;
  twitter_handle: Nullable<string>;
  youtube_handle: Nullable<string>;
  website: Nullable<string>;
}

// Private profile interface (user's own profile)
export interface PrivateProfile extends BaseProfile {
  linkedin_handle: Nullable<string>;
  tiktok_handle: Nullable<string>;
  timezone: Nullable<string>;
  notification_settings: Nullable<Record<string, any>>;
  display_preferences: Nullable<Record<string, any>>;
  privacy_settings: Nullable<Record<string, any>>;
  date_of_birth: Nullable<string>;
  gender: Nullable<Gender>;
}

// Admin profile interface (with additional metadata)
export interface AdminProfile extends PrivateProfile {
  user_email: string;
  user_id: number;
  is_active: boolean;
  last_login: Nullable<string>;
}

// Onboarding types
export interface Onboarding extends TimeStamp {
  id: string;
  data: Record<string, any>;
  is_complete: boolean;
  skipped: boolean;
}

// Request types
export interface UpdateProfileRequest {
  bio?: string;
  avatar?: string;
  location?: string;
  instagram_handle?: string;
  twitter_handle?: string;
  linkedin_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string;
  website?: string;
  date_of_birth?: string;
  gender?: Gender;
  timezone?: string;
  notification_settings?: Record<string, any>;
  display_preferences?: Record<string, any>;
  privacy_settings?: Record<string, any>;
}

export interface UpdateOnboardingRequest {
  data?: Record<string, any>;
  is_complete?: boolean;
  skipped?: boolean;
}

// Response types
export interface ProfileResponse {
  message: string;
  data: BaseProfile | PrivateProfile | AdminProfile;
}

export interface OnboardingResponse {
  message: string;
  data: Onboarding;
}

// Profile notification settings types
export interface NotificationSettings {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  event_reminders?: boolean;
  ticket_updates?: boolean;
  payment_notifications?: boolean;
  [key: string]: any;
}

// Display preferences types
export interface DisplayPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  currency?: string;
  date_format?: string;
  time_format?: string;
  [key: string]: any;
}

// Privacy settings types
export interface PrivacySettings {
  profile_visibility?: "public" | "private" | "connections";
  show_email?: boolean;
  show_phone?: boolean;
  show_location?: boolean;
  show_social_media?: boolean;
  [key: string]: any;
}

/**
 * Response interfaces
 */
export interface NotificationSettingsResponse extends SuccessResponse<NotificationSettings> {}

export interface NotificationSettingsListResponse extends SuccessResponse<PaginatedResponse<NotificationSettings>> {}

export interface NotificationPreferencesResponse
  extends SuccessResponse<{
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    notification_types: Record<string, boolean>;
  }> {}
