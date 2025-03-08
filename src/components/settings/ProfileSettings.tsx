
import { useSettings } from "@/hooks/useSettings";
import ProfilePictureCard from "./ProfilePictureCard";
import PersonalInfoForm from "./PersonalInfoForm";

const ProfileSettings = () => {
  const { profile } = useSettings();

  return (
    <div className="space-y-6">
      <ProfilePictureCard 
        profilePicUrl={profile?.profile_picture_url} 
        firstName={profile?.first_name}
        lastName={profile?.last_name}
      />
      <PersonalInfoForm />
    </div>
  );
};

export default ProfileSettings;
