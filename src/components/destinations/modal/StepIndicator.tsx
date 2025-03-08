
import React from "react";

interface StepIndicatorProps {
  step: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, currentStep }) => {
  const isCompleted = step < currentStep;
  const isActive = step === currentStep;
  
  return (
    <div 
      className={`
        flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
        ${isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'}
      `}
    >
      {step}
    </div>
  );
};

export default StepIndicator;
