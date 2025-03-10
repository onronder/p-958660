import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoogleDriveConfigProps {
  handleOAuthLogin: (provider: 'google_drive' | 'onedrive') => void;
}

const GoogleDriveConfig: React.FC<GoogleDriveConfigProps> = ({ handleOAuthLogin }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const initiateConnection = async () => {
    try {
      setIsConnecting(true);
      await handleOAuthLogin('google_drive');
    } finally {
      // We keep this set to true as the OAuth process happens in another window
      // It will be reset when the modal is closed or when OAuth callback is received
    }
  };

  return (
    <div className="space-y-4 flex flex-col items-center justify-center py-8">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Connect to Google Drive by authorizing FlowTechs to access your account.
      </p>
      <Button 
        className="w-full max-w-xs"
        onClick={initiateConnection}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Sign in with Google"
        )}
      </Button>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p className="text-center">Make sure you've authorized the application in Google Cloud Console</p>
        <p className="text-center mt-1">Check that the redirect URI is set to: <code className="bg-muted p-1 rounded">{window.location.origin}/auth/callback</code></p>
      </div>
    </div>
  );
};

export default GoogleDriveConfig;
