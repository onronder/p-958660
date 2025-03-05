
import { useState } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";

export function useProfileSettings() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { profile } = await invokeSettingsFunction("get_profile");
      setProfile(profile);
      return profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { profile } = await invokeSettingsFunction("update_profile", profileData);
      setProfile(profile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      return profile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user) return false;
    
    try {
      const { success } = await invokeSettingsFunction("complete_onboarding");
      
      // Update the profile in the state
      if (profile) {
        setProfile({
          ...profile,
          onboarding_completed: true
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      return false;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences: {
    dark_mode?: boolean;
    notifications_enabled?: boolean;
    timezone?: string;
    language?: string;
    auto_logout_minutes?: number;
  }) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { preferences: updatedPreferences } = await invokeSettingsFunction("update_preferences", preferences);
      
      // Update the profile in state
      if (profile) {
        setProfile({
          ...profile,
          ...preferences
        });
      }
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully.",
      });
      
      return updatedPreferences;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    completeOnboarding,
    updatePreferences
  };
}
