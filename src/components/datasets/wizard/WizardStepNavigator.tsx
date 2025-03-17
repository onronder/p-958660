
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WizardStepNavigatorProps {
  activeStep: string;
  handleBack: () => void;
  handleNext: () => void;
  canProceedFromDetails: () => boolean;
  canProceedFromConfig: () => boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  createDataset: () => void;
  onClose: (success?: boolean) => void;
}

const WizardStepNavigator: React.FC<WizardStepNavigatorProps> = ({
  activeStep,
  handleBack,
  handleNext,
  canProceedFromDetails,
  canProceedFromConfig,
  isLoading,
  isSubmitting,
  createDataset,
  onClose
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
      {activeStep !== "source" && (
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          Back
        </Button>
      )}
      
      <div className="flex space-x-2">
        <Button variant="outline" onClick={() => onClose()} disabled={isSubmitting}>
          Cancel
        </Button>
        
        {activeStep !== "configuration" ? (
          <Button 
            onClick={handleNext} 
            disabled={
              (activeStep === "details" && !canProceedFromDetails()) ||
              isLoading ||
              isSubmitting
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Next"
            )}
          </Button>
        ) : (
          <Button 
            onClick={createDataset} 
            disabled={!canProceedFromConfig() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Dataset"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WizardStepNavigator;
