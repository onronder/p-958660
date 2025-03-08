
import { useCallback } from "react";
import { useSettingsBase, Profile } from "./useSettingsBase";

export function useProfileMedia(
  profile: Profile | null,
  setProfile: (profile: Profile) => void,
  lastFetchTime: React.MutableRefObject<number>
) {
  const { user, toast, uploadProfilePicture } = useSettingsBase();

  // Upload profile picture with better error handling
  const updateProfilePicture = useCallback(async (file: File) => {
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
  }, [user, uploadProfilePicture, profile, setProfile, lastFetchTime, toast]);

  return {
    updateProfilePicture
  };
}
