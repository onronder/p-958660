
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";

interface ProfilePictureCardProps {
  profilePicUrl?: string;
  firstName?: string;
  lastName?: string;
}

const ProfilePictureCard = ({ profilePicUrl, firstName, lastName }: ProfilePictureCardProps) => {
  const { updateProfilePicture } = useSettings();
  const { user } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      await updateProfilePicture(file);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Function to get user initials for avatar fallback
  const getUserInitials = (): string => {
    const firstInitial = firstName ? firstName.charAt(0) : "";
    const lastInitial = lastName ? lastName.charAt(0) : "";
    
    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Customize your profile picture. This will be displayed throughout the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profilePicUrl} />
            <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <label htmlFor="avatar-upload">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button" asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Image
                  </div>
                </Button>
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <p className="text-sm text-muted-foreground mt-2">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureCard;
