
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDestinations } from "@/hooks/useDestinations";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "./modal/ProgressBar";
import StepOne from "./modal/StepOne";
import StepTwo from "./modal/StepTwo";
import StepThree from "./modal/StepThree";

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (destination: any) => void;
}

const AddDestinationModal: React.FC<AddDestinationModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
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

  useEffect(() => {
    const handleOAuthRedirect = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      try {
        if (event.data && event.data.type === "oauth_callback") {
          const { provider, code } = event.data;
          
          if (provider && code) {
            const redirectUri = `${window.location.origin}/auth/callback`;
            
            await handleOAuthCallback(
              provider === 'google_drive' ? 'google_drive' : 'onedrive',
              code,
              redirectUri
            );
            
            setOauthComplete(true);
            setOauthError(null);
            
            setCurrentStep(3);
          } else if (event.data && event.data.type === "oauth_error") {
            console.error("OAuth error:", event.data);
            setOauthError({
              error: event.data.error,
              description: event.data.description || "Authentication failed",
              detailedMessage: event.data.detailedMessage
            });
          }
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "Failed to complete authentication",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('message', handleOAuthRedirect);
    
    return () => {
      window.removeEventListener('message', handleOAuthRedirect);
    };
  }, [handleOAuthCallback, toast]);

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 && "Select Destination Type"}
            {currentStep === 2 && `Configure ${destinationType}`}
            {currentStep === 3 && "Export Settings"}
          </DialogTitle>
        </DialogHeader>
        
        <div>
          <ProgressBar currentStep={currentStep} />
        
          {currentStep === 1 && (
            <StepOne 
              destinationType={destinationType} 
              setDestinationType={setDestinationType} 
            />
          )}
          
          {currentStep === 2 && (
            <StepTwo 
              destinationType={destinationType}
              name={name}
              setName={setName}
              updateCredential={updateCredential}
              handleOAuthLogin={handleOAuthLogin}
              oauthError={oauthError}
            />
          )}
          
          {currentStep === 3 && (
            <StepThree 
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              schedule={schedule}
              setSchedule={setSchedule}
            />
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
              Back
            </Button>
          )}
          <div>
            <Button variant="ghost" onClick={handleClose} className="mr-2">
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && !destinationType || currentStep === 2 && !canProceedFromStep2()}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Add Destination
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDestinationModal;
