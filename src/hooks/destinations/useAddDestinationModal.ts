
import { useState } from "react";
import { useAddDestination } from "@/hooks/destinations/useAddDestination";
import { useToast } from "@/hooks/use-toast";
import { useOAuthModal } from "./modal/useOAuthModal";
import { useValidation } from "./modal/useValidation";
import { DestinationModalState } from "./modal/types";

export const useAddDestinationModal = (onClose: () => void, onAdd: (destination: any) => void) => {
  // Basic state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [destinationType, setDestinationType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("CSV");
  const [schedule, setSchedule] = useState<string>("Manual");
  const [credentials, setCredentials] = useState<Record<string, any>>({});

  // Import sub-hooks
  const { toast } = useToast();
  const { 
    oauthComplete,
    oauthError,
    setOauthComplete,
    setOauthError,
    handleOAuthLogin,
    processOAuthCallback 
  } = useOAuthModal();
  
  const { canProceedFromStep2 } = useValidation(
    destinationType,
    name,
    credentials,
    oauthComplete
  );

  // Reset form to initial state
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

  // Close modal and reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle form submission
  const handleSubmit = () => {
    // Get storage type from destination type
    const storageType = destinationType === 'Google Drive' ? 'google_drive' :
                        destinationType === 'Microsoft OneDrive' ? 'onedrive' :
                        destinationType === 'AWS S3' ? 'aws_s3' :
                        destinationType === 'FTP/SFTP' ? 'ftp_sftp' :
                        'custom_api';
    
    // For SFTP/FTP, ensure we have the correct protocol type in the storage_type
    let actualStorageType = storageType;
    if (storageType === 'ftp_sftp' && credentials.protocol) {
      actualStorageType = credentials.protocol;
    }
    
    // Transform credentials for FTP/SFTP to ensure proper format
    let processedCredentials = { ...credentials };
    
    // Convert port to number for FTP/SFTP
    if (storageType === 'ftp_sftp' && processedCredentials.port) {
      processedCredentials.port = Number(processedCredentials.port);
    }
    
    // Package the destination object
    const destinationObject = {
      name,
      type: destinationType,
      storageType: actualStorageType,
      status: "Pending",
      exportFormat,
      schedule,
      lastExport: null,
      credentials: processedCredentials
    };
    
    console.log("Submitting destination:", destinationObject);
    
    onAdd(destinationObject);
    resetForm();
  };

  // Update a credential field
  const updateCredential = (field: string, value: any) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return {
    // Basic state
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
    
    // OAuth state
    oauthComplete,
    oauthError,
    
    // Actions
    handleClose,
    handleSubmit,
    updateCredential,
    handleOAuthLogin,
    processOAuthCallback,
    
    // Validation
    canProceedFromStep2
  };
};
