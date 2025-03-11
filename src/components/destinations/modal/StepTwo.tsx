
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GoogleDriveConfig from "./GoogleDriveConfig";
import OneDriveConfig from "./OneDriveConfig";
import FtpSftpConfig from "./FtpSftpConfig";
import AwsS3Config from "./AwsS3Config";
import CustomApiConfig from "./CustomApiConfig";
import OAuthError from "./OAuthError";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { OAuthError as OAuthErrorType } from "@/hooks/destinations/modal/types";

interface StepTwoProps {
  destinationType: string;
  name: string;
  setName: (name: string) => void;
  updateCredential: (field: string, value: any) => void;
  handleOAuthLogin: (provider: 'google_drive' | 'onedrive') => void;
  oauthError: OAuthErrorType | null;
  credentials: Record<string, any>;
}

const StepTwo: React.FC<StepTwoProps> = ({ 
  destinationType,
  name,
  setName,
  updateCredential,
  handleOAuthLogin,
  oauthError,
  credentials
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Destination Name</Label>
        <Input 
          id="name" 
          placeholder="e.g., Monthly Backup Server" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <OAuthError error={oauthError} />
      
      {destinationType === "Google Drive" && (
        <div>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Google Drive integration is coming soon. Please select another destination type.
            </AlertDescription>
          </Alert>
          <GoogleDriveConfig handleOAuthLogin={handleOAuthLogin} />
        </div>
      )}
      
      {destinationType === "Microsoft OneDrive" && (
        <div>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Microsoft OneDrive integration is coming soon. Please select another destination type.
            </AlertDescription>
          </Alert>
          <OneDriveConfig handleOAuthLogin={handleOAuthLogin} />
        </div>
      )}
      
      {destinationType === "FTP/SFTP" && (
        <FtpSftpConfig 
          updateCredential={updateCredential} 
          credentials={credentials}
          name={name}
        />
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
