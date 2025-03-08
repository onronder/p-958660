
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GoogleDriveConfig from "./GoogleDriveConfig";
import OneDriveConfig from "./OneDriveConfig";
import FtpSftpConfig from "./FtpSftpConfig";
import AwsS3Config from "./AwsS3Config";
import CustomApiConfig from "./CustomApiConfig";
import OAuthError from "./OAuthError";

interface StepTwoProps {
  destinationType: string;
  name: string;
  setName: (name: string) => void;
  updateCredential: (field: string, value: string) => void;
  handleOAuthLogin: (provider: 'google_drive' | 'onedrive') => void;
  oauthError: {
    error: string;
    description: string;
    detailedMessage?: string;
  } | null;
}

const StepTwo: React.FC<StepTwoProps> = ({ 
  destinationType,
  name,
  setName,
  updateCredential,
  handleOAuthLogin,
  oauthError
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Destination Name</Label>
        <Input 
          id="name" 
          placeholder="e.g., Monthly Backup Drive" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <OAuthError error={oauthError} />
      
      {destinationType === "Google Drive" && (
        <GoogleDriveConfig handleOAuthLogin={handleOAuthLogin} />
      )}
      
      {destinationType === "Microsoft OneDrive" && (
        <OneDriveConfig handleOAuthLogin={handleOAuthLogin} />
      )}
      
      {destinationType === "FTP/SFTP" && (
        <FtpSftpConfig updateCredential={updateCredential} />
      )}
      
      {destinationType === "AWS S3" && (
        <AwsS3Config updateCredential={updateCredential} />
      )}
      
      {destinationType === "Custom API" && (
        <CustomApiConfig updateCredential={updateCredential} />
      )}
    </div>
  );
};

export default StepTwo;
