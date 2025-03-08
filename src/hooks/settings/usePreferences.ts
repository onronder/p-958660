
import { useCallback } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";
import { useTheme } from "@/components/theme/ThemeProvider";

export function usePreferences(
  profile: Profile | null,
  setProfile: (profile: Profile) => void,
  lastFetchTime: React.MutableRefObject<number>
) {
  const { user, toast, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const { setTheme } = useTheme();

  // Update user preferences with better error handling
  const updatePreferences = useCallback(async (preferences: {
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
  }, [user, invokeSettingsFunction, setTheme, toast, setIsLoading, profile, setProfile, lastFetchTime]);

  return {
    updatePreferences
  };
}
