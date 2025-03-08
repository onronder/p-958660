
import { useState, useCallback, useRef, useEffect } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";
import { useTheme } from "@/components/theme/ThemeProvider";

export function useProfileSettings() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction, uploadProfilePicture } = useSettingsBase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { setTheme } = useTheme();
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef(0);
  const CACHE_TIME = 10000; // 10 seconds cache
  const fetchAttempts = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;

  // Clean up theme and profiles on unmount
  useEffect(() => {
    return () => {
      // Reset fetch attempt counter on unmount
      fetchAttempts.current = 0;
    };
  }, []);

  // Fetch user profile with improved error handling and caching
  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    
    // Check if fetch is already in progress
    if (fetchInProgress.current) {
      console.log("Profile fetch already in progress, skipping duplicate request");
      return profile;
    }
    
    // Check if we have recent data
    const now = Date.now();
    if (profile && (now - lastFetchTime.current < CACHE_TIME)) {
      console.log("Using cached profile data");
      return profile;
    }
    
    fetchInProgress.current = true;
    setIsLoading(true);
    
    try {
      // Increment attempt counter
      fetchAttempts.current += 1;
      
      console.log(`Fetching profile for user: ${user.id} (Attempt ${fetchAttempts.current})`);
      const { profile: fetchedProfile } = await invokeSettingsFunction("get_profile");
      console.log("Received profile:", fetchedProfile);
      
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        lastFetchTime.current = Date.now();
        fetchAttempts.current = 0; // Reset counter on success
      }
      
      return fetchedProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      
      // Determine if we should retry
      if (fetchAttempts.current >= MAX_RETRY_ATTEMPTS) {
        toast({
          title: "Error",
          description: "Failed to load profile after multiple attempts. Please reload the page.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile information. Please try again later.",
          variant: "destructive",
        });
      }
      
      throw error; // Re-throw to allow handling by the component
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [user, invokeSettingsFunction, setTheme, toast, setIsLoading, profile]);

  // Update user profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      console.log("Updating profile with data:", profileData);
      const { profile } = await invokeSettingsFunction("update_profile", profileData);
      
      if (profile) {
        setProfile(profile);
        lastFetchTime.current = Date.now();
        
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
        const updatedProfile = {
          ...profile,
          ...preferences
        };
        
        setProfile(updatedProfile);
        lastFetchTime.current = Date.now();
        
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
        const updatedProfile = {
          ...profile,
          onboarding_completed: true
        };
        
        setProfile(updatedProfile);
        lastFetchTime.current = Date.now();
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
        const updatedProfile = {
          ...profile,
          profile_picture_url: pictureUrl
        };
        
        setProfile(updatedProfile);
        lastFetchTime.current = Date.now();
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
