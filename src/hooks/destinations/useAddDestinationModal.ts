
import { useState, useCallback } from "react";
import { useAddDestination } from "@/hooks/destinations/useAddDestination";
import { useToast } from "@/hooks/use-toast";
import { useOAuthModal } from "./modal/useOAuthModal";
import { useValidation } from "./modal/useValidation";
import { DestinationModalState } from "./modal/types";
import { useAuth } from "@/contexts/AuthContext";

export const useAddDestinationModal = (onClose: () => void, onAdd: (destination: any) => void) => {
  const { profile } = useAuth();
  const isPro = profile?.subscription_tier === 'pro';
  
  // Basic state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [destinationType, setDestinationType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("CSV");
  const [saveToStorage, setSaveToStorage] = useState<boolean>(isPro); // Default to true for Pro users
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

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

  // Initialize edit mode
  const initializeEditMode = useCallback((destination: any) => {
    setIsEditMode(true);
    setEditId(destination.id);
    setDestinationType(destination.destination_type);
    setName(destination.name);
    setExportFormat(destination.export_format);
    setSaveToStorage(destination.save_to_storage || false);
    setCredentials(destination.credentials || {});
    setCurrentStep(destination.credentials ? 3 : 2); // Skip to step 2 or 3 based on whether credentials are present
    setOauthComplete(!!destination.credentials);
  }, [setOauthComplete]);

  // Reset form to initial state
  const resetForm = () => {
    setCurrentStep(1);
    setDestinationType("");
    setName("");
    setExportFormat("CSV");
    setSaveToStorage(isPro);
    setCredentials({});
    setOauthComplete(false);
    setOauthError(null);
    setIsEditMode(false);
    setEditId(null);
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
      destination_type: destinationType, // For consistency with backend
      storageType: actualStorageType,
      status: isEditMode ? undefined : "Pending", // Don't update status on edit
      export_format: exportFormat,
      save_to_storage: saveToStorage, // Add saveToStorage property
      schedule: "Manual", // Keep a default value for backend compatibility
      lastExport: null,
      credentials: processedCredentials
    };
    
    // If in edit mode, include the ID
    if (isEditMode && editId) {
      destinationObject.id = editId;
    }
    
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
    saveToStorage,
    setSaveToStorage,
    credentials,
    isEditMode,
    
    // OAuth state
    oauthComplete,
    oauthError,
    
    // Actions
    handleClose,
    handleSubmit,
    updateCredential,
    handleOAuthLogin,
    processOAuthCallback,
    initializeEditMode,
    
    // Validation
    canProceedFromStep2
  };
};
