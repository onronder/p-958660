
import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalNavigationProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  handleClose: () => void;
  handleSubmit: () => void;
  canProceedFromStep2: () => boolean;
  destinationType: string;
}

const ModalNavigation: React.FC<ModalNavigationProps> = ({
  currentStep,
  setCurrentStep,
  handleClose,
  handleSubmit,
  canProceedFromStep2,
  destinationType
}) => {
  return (
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
  );
};

export default ModalNavigation;
