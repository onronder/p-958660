
import React from "react";
import { Button } from "@/components/ui/button";

interface GoogleDriveConfigProps {
  handleOAuthLogin: (provider: 'google_drive' | 'onedrive') => void;
}

const GoogleDriveConfig: React.FC<GoogleDriveConfigProps> = ({ handleOAuthLogin }) => {
  return (
    <div className="space-y-4 flex flex-col items-center justify-center py-8">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Connect to Google Drive by authorizing FlowTechs to access your account.
      </p>
      <Button 
        className="w-full max-w-xs"
        onClick={() => handleOAuthLogin('google_drive')}
      >
        Sign in with Google
      </Button>
    </div>
  );
};

export default GoogleDriveConfig;
