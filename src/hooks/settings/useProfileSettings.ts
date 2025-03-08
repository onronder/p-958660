import { useState } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";
import { useTheme } from "@/components/theme/ThemeProvider";

export function useProfileSettings() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction, uploadProfilePicture } = useSettingsBase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { setTheme } = useTheme();

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { profile } = await invokeSettingsFunction("get_profile");
      setProfile(profile);
      
      // Apply theme using ThemeProvider instead of direct DOM manipulation
      if (profile?.dark_mode !== undefined) {
        setTheme(profile.dark_mode ? "dark" : "light");
      }
      
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
      
      // Apply dark mode setting if it was changed using ThemeProvider
      if (profileData.dark_mode !== undefined) {
        setTheme(profileData.dark_mode ? "dark" : "light");
      }
      
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
      
      // Apply dark mode setting if it was changed using ThemeProvider
      if (preferences.dark_mode !== undefined) {
        setTheme(preferences.dark_mode ? "dark" : "light");
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

  // Upload profile picture
  const updateProfilePicture = async (file: File) => {
    if (!user) return null;
    
    try {
      const pictureUrl = await uploadProfilePicture(file);
      
      // Update the profile in state with the new picture URL
      if (profile && pictureUrl) {
        setProfile({
          ...profile,
          profile_picture_url: pictureUrl
        });
      }
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      return pictureUrl;
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
      return null;
    }
  };

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
