
import React from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface StepSelectorProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  steps: Step[];
}

const StepSelector: React.FC<StepSelectorProps> = ({
  currentStep,
  setCurrentStep,
  steps
}) => {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : index < steps.findIndex((s) => s.id === currentStep)
                  ? "bg-primary/80 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              onClick={() => {
                // Only allow going back to previous steps
                if (index <= steps.findIndex((s) => s.id === currentStep)) {
                  setCurrentStep(step.id);
                }
              }}
              role={index <= steps.findIndex((s) => s.id === currentStep) ? "button" : undefined}
              tabIndex={index <= steps.findIndex((s) => s.id === currentStep) ? 0 : undefined}
              aria-current={currentStep === step.id ? "step" : undefined}
            >
              {index + 1}
            </div>
            <span className={cn(
              "text-xs mt-2 font-medium",
              currentStep === step.id
                ? "text-foreground"
                : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "h-[2px] flex-1",
              index < steps.findIndex((s) => s.id === currentStep)
                ? "bg-primary/80"
                : "bg-muted"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepSelector;
