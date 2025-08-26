import type { UpdateConsentRequest, UpdateOnboardingRequest, UpdateProfileRequest } from "@/types/preferences";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { preferencesService } from "@/services/preferences.service";

export const usePreferences = () => {
  const queryClient = useQueryClient();

  // Profile preferences
  const useProfile = () => {
    return useQuery({
      queryKey: ["preferences-profile"],
      queryFn: () => preferencesService.getProfile(),
    });
  };

  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: (data: UpdateProfileRequest) => preferencesService.updateProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["preferences-profile"] });
      },
    });
  };

  const useSyncFromUser = () => {
    return useMutation({
      mutationFn: () => preferencesService.syncFromUser(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["preferences-profile"] });
      },
    });
  };

  // Onboarding
  const useOnboarding = () => {
    return useQuery({
      queryKey: ["onboarding"],
      queryFn: () => preferencesService.getOnboarding(),
    });
  };

  const useUpdateOnboarding = () => {
    return useMutation({
      mutationFn: (data: UpdateOnboardingRequest) => preferencesService.updateOnboarding(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      },
    });
  };

  // Consent
  const useConsentPreferences = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ["consent"],
      queryFn: () => preferencesService.getConsent(),
      staleTime: 5 * 60 * 1000, // 5 minutes - consent doesn't change often
      enabled: options?.enabled ?? true, // Default to enabled unless explicitly disabled
    });
  };

  const useUpdateConsent = () => {
    return useMutation({
      mutationFn: (data: UpdateConsentRequest) => preferencesService.updateConsent(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consent"] });
      },
    });
  };

  return {
    // Profile preferences
    useProfile,
    useUpdateProfile,
    useSyncFromUser,
    // Onboarding
    useOnboarding,
    useUpdateOnboarding,
    // Consent
    useConsentPreferences,
    useUpdateConsent,
  };
};
