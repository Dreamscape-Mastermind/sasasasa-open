import {
  OnboardingResponse,
  ProfileResponse,
  UpdateOnboardingRequest,
  UpdateProfileRequest,
} from "@/types/preferences";

import { apiClient } from "./api.service";

/**
 * Preferences service for handling all user preferences-related operations
 */
class PreferencesService {
  private static instance: PreferencesService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  /**
   * Profile preferences operations
   */
  public async getProfile(): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>(`${this.baseUrl}/preferences/profile/me`);
  }

  public async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    return apiClient.patch<ProfileResponse>(`${this.baseUrl}/preferences/profile/me`, data);
  }

  public async syncFromUser(): Promise<ProfileResponse> {
    return apiClient.post<ProfileResponse>(`${this.baseUrl}/preferences/profile/me/sync_from_user`);
  }

  /**
   * Onboarding operations
   */
  public async getOnboarding(): Promise<OnboardingResponse> {
    return apiClient.get<OnboardingResponse>(`${this.baseUrl}/preferences/onboarding`);
  }

  public async updateOnboarding(data: UpdateOnboardingRequest): Promise<OnboardingResponse> {
    return apiClient.patch<OnboardingResponse>(`${this.baseUrl}/preferences/onboarding`, data);
  }
}

export const preferencesService = PreferencesService.getInstance();
