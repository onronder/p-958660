
import { useCallback } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";
import { useTheme } from "@/components/theme/ThemeProvider";

export function useProfileUpdate(
  profile: Profile | null,
  setProfile: (profile: Profile) => void,
  lastFetchTime: React.MutableRefObject<number>
) {
  const { user, toast, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const { setTheme } = useTheme();

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<Profile>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      console.log("Updating profile with data:", profileData);
      const { profile: updatedProfile } = await invokeSettingsFunction("update_profile", profileData);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
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
      
      return updatedProfile;
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
  }, [user, invokeSettingsFunction, setTheme, toast, setIsLoading, setProfile, lastFetchTime]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
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
  }, [user, profile, invokeSettingsFunction, setProfile, lastFetchTime]);

  return {
    updateProfile,
    completeOnboarding
  };
}
