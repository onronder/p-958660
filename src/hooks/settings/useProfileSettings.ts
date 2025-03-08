
import { useState, useEffect } from "react";
import { useProfileFetch } from "./useProfileFetch";
import { useProfileUpdate } from "./useProfileUpdate";
import { usePreferences } from "./usePreferences";
import { useProfileMedia } from "./useProfileMedia";
import { useSettingsBase } from "./useSettingsBase";

export function useProfileSettings() {
  const { isLoading } = useSettingsBase();
  const { profile, setProfile, fetchProfile, lastFetchTime } = useProfileFetch();
  const { updateProfile, completeOnboarding } = useProfileUpdate(profile, setProfile, lastFetchTime);
  const { updatePreferences } = usePreferences(profile, setProfile, lastFetchTime);
  const { updateProfilePicture } = useProfileMedia(profile, setProfile, lastFetchTime);

  // Reset fetch attempt counter on unmount
  useEffect(() => {
    return () => {
      // Cleanup resources if needed
    };
  }, []);

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    completeOnboarding,
    updatePreferences,
    updateProfilePicture
  };
}
