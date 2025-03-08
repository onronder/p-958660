
import { useState, useCallback, useRef } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";
import { useTheme } from "@/components/theme/ThemeProvider";

export function useProfileFetch() {
  const { user, toast, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { setTheme } = useTheme();
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef(0);
  const CACHE_TIME = 10000; // 10 seconds cache
  const fetchAttempts = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;

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
        
        // Apply theme setting from profile
        if (fetchedProfile.dark_mode !== undefined) {
          setTheme(fetchedProfile.dark_mode ? "dark" : "light");
        }
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

  return {
    profile,
    setProfile,
    fetchProfile,
    lastFetchTime
  };
}
