
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProgressBar from "./modal/ProgressBar";
import StepOne from "./modal/StepOne";
import StepTwo from "./modal/StepTwo";
import StepThree from "./modal/StepThree";
import { useAddDestinationModal } from "@/hooks/destinations/useAddDestinationModal";
import ModalNavigation from "./modal/ModalNavigation";

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
  const {
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
    updateCredential,
    handleOAuthLogin,
    oauthError,
    handleClose,
    handleSubmit,
    processOAuthCallback,
    canProceedFromStep2
  } = useAddDestinationModal(onClose, onAdd);

  useEffect(() => {
    const handleOAuthRedirect = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      try {
        if (event.data && event.data.type === "oauth_callback") {
          const { provider, code } = event.data;
          
          if (provider && code) {
            await processOAuthCallback(provider, code);
            // Move to the next step after successful authentication
            setCurrentStep(3);
          } else if (event.data && event.data.type === "oauth_error") {
            console.error("OAuth error:", event.data);
          }
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
      }
    };

    window.addEventListener('message', handleOAuthRedirect);
    
    return () => {
      window.removeEventListener('message', handleOAuthRedirect);
    };
  }, [processOAuthCallback, setCurrentStep]);

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
              credentials={credentials}
            />
          )}
          
          {currentStep === 3 && (
            <StepThree 
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              saveToStorage={saveToStorage}
              setSaveToStorage={setSaveToStorage}
            />
          )}
        </div>
        
        <ModalNavigation 
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          canProceedFromStep2={canProceedFromStep2}
          destinationType={destinationType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddDestinationModal;
