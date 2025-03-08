
import { useState, useCallback } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";
import { useTheme } from "@/components/theme/ThemeProvider";

export function useProfileSettings() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction, uploadProfilePicture } = useSettingsBase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { theme, setTheme } = useTheme();

  // Fetch user profile with improved error handling
  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      console.log("Fetching profile for user:", user.id);
      const { profile } = await invokeSettingsFunction("get_profile");
      console.log("Received profile:", profile);
      
      if (profile) {
        setProfile(profile);
        
        // Only apply theme if it's different from current to avoid flicker
        if (profile.dark_mode !== undefined && 
            ((profile.dark_mode && theme !== "dark") || 
             (!profile.dark_mode && theme !== "light"))) {
          setTheme(profile.dark_mode ? "dark" : "light");
        }
      }
      
      return profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
      throw error; // Re-throw to allow handling by the component
    } finally {
      setIsLoading(false);
    }
  }, [user, invokeSettingsFunction, setTheme, theme, toast, setIsLoading]);

  // Update user profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      console.log("Updating profile with data:", profileData);
      const { profile } = await invokeSettingsFunction("update_profile", profileData);
      
      if (profile) {
        setProfile(profile);
        
        // Apply dark mode setting if it was changed
        if (profileData.dark_mode !== undefined) {
          setTheme(profileData.dark_mode ? "dark" : "light");
        }
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }
      
      return profile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user preferences with better error handling
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
      console.log("Updating preferences with data:", preferences);
      const { preferences: updatedPreferences } = await invokeSettingsFunction("update_preferences", preferences);
      
      // Update the profile in state if successful
      if (profile && updatedPreferences) {
        setProfile({
          ...profile,
          ...preferences
        });
        
        // Apply dark mode setting if it was changed
        if (preferences.dark_mode !== undefined) {
          setTheme(preferences.dark_mode ? "dark" : "light");
        }
        
        toast({
          title: "Preferences Updated",
          description: "Your preferences have been updated successfully.",
        });
      }
      
      return updatedPreferences;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      throw error;
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
      if (success && profile) {
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

  // Upload profile picture with better error handling
  const updateProfilePicture = async (file: File) => {
    if (!user) return null;
    
    try {
      console.log("Uploading profile picture");
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
      throw error;
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
