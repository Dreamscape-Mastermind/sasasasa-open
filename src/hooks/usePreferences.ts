import type { UpdateOnboardingRequest, UpdateProfileRequest } from "@/types/preferences";
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

  return {
    // Profile preferences
    useProfile,
    useUpdateProfile,
    useSyncFromUser,
    // Onboarding
    useOnboarding,
    useUpdateOnboarding,
  };
};
