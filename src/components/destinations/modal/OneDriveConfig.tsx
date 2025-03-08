
import React from "react";
import { Button } from "@/components/ui/button";

interface OneDriveConfigProps {
  handleOAuthLogin: (provider: 'google_drive' | 'onedrive') => void;
}

const OneDriveConfig: React.FC<OneDriveConfigProps> = ({ handleOAuthLogin }) => {
  return (
    <div className="space-y-4 flex flex-col items-center justify-center py-8">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Connect to Microsoft OneDrive by authorizing FlowTechs to access your account.
      </p>
      <Button 
        className="w-full max-w-xs"
        onClick={() => handleOAuthLogin('onedrive')}
      >
        Sign in with Microsoft
      </Button>
    </div>
  );
};

export default OneDriveConfig;
