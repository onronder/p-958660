
import { useState } from "react";
import { useDestinations } from "@/hooks/useDestinations";
import { useToast } from "@/hooks/use-toast";

export const useAddDestinationModal = (onClose: () => void, onAdd: (destination: any) => void) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [destinationType, setDestinationType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("CSV");
  const [schedule, setSchedule] = useState<string>("Manual");
  const { initiateOAuth, handleOAuthCallback } = useDestinations();
  const { toast } = useToast();
  
  const [credentials, setCredentials] = useState<any>({});
  const [oauthComplete, setOauthComplete] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<{
    error: string;
    description: string;
    detailedMessage?: string;
  } | null>(null);

  const resetForm = () => {
    setCurrentStep(1);
    setDestinationType("");
    setName("");
    setExportFormat("CSV");
    setSchedule("Manual");
    setCredentials({});
    setOauthComplete(false);
    setOauthError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const storageType = destinationType === 'Google Drive' ? 'google_drive' :
                        destinationType === 'Microsoft OneDrive' ? 'onedrive' :
                        destinationType === 'AWS S3' ? 'aws_s3' :
                        destinationType === 'FTP/SFTP' ? 'ftp_sftp' :
                        'custom_api';
                        
    onAdd({
      name,
      type: destinationType,
      storageType,
      status: "Pending",
      exportFormat,
      schedule,
      lastExport: null,
      credentials
    });
    resetForm();
  };

  const updateCredential = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleOAuthLogin = async (provider: 'google_drive' | 'onedrive') => {
    try {
      setOauthError(null);
      
      // Use the consistent redirect URI
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      await initiateOAuth(provider, redirectUri);
      
      toast({
        title: "Authorization Required",
        description: `Please authorize with ${provider === 'google_drive' ? 'Google' : 'Microsoft'} in the new window.`,
      });
    } catch (error) {
      console.error("Error initiating OAuth flow:", error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        variant: "destructive",
      });
    }
  };

  const processOAuthCallback = async (provider: string, code: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      await handleOAuthCallback(
        provider === 'google_drive' ? 'google_drive' : 'onedrive',
        code,
        redirectUri
      );
      
      setOauthComplete(true);
      setOauthError(null);
      
      setCurrentStep(3);
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      setOauthError({
        error: "callback_processing_failed",
        description: error instanceof Error ? error.message : "Failed to process authorization",
        detailedMessage: "An error occurred while processing the OAuth callback"
      });
    }
  };

  const canProceedFromStep2 = () => {
    if (name === "") return false;
    
    if (destinationType === "Google Drive" || destinationType === "Microsoft OneDrive") {
      return oauthComplete;
    }
    
    if (destinationType === "AWS S3") {
      return credentials.accessKey && credentials.secretKey && credentials.bucket && credentials.region;
    }
    
    if (destinationType === "FTP/SFTP") {
      return credentials.host && credentials.username && credentials.password;
    }
    
    if (destinationType === "Custom API") {
      return credentials.baseUrl;
    }
    
    return false;
  };

  return {
    currentStep,
    setCurrentStep,
    destinationType,
    setDestinationType,
    name,
    setName,
    exportFormat,
    setExportFormat,
    schedule,
    setSchedule,
    credentials,
    oauthComplete,
    oauthError,
    handleClose,
    handleSubmit,
    updateCredential,
    handleOAuthLogin,
    processOAuthCallback,
    canProceedFromStep2
  };
};
