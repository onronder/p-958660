
import React from "react";
import StepIndicator from "./StepIndicator";

interface ProgressBarProps {
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <StepIndicator step={1} currentStep={currentStep} />
      <div className="flex-grow mx-2 h-1 bg-muted rounded-full">
        <div 
          className="h-full bg-primary rounded-full transition-all" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>
      </div>
      <StepIndicator step={2} currentStep={currentStep} />
      <div className="flex-grow mx-2 h-1 bg-muted rounded-full">
        <div 
          className="h-full bg-primary rounded-full transition-all" 
          style={{ width: `${(currentStep === 3 ? 1 : 0) * 100}%` }}
        ></div>
      </div>
      <StepIndicator step={3} currentStep={currentStep} />
    </div>
  );
};

export default ProgressBar;
