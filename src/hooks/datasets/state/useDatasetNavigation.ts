
import { useState, useCallback } from 'react';
import { StepType } from './types';

export function useDatasetNavigation(currentStep: StepType, setCurrentStep: (step: StepType) => void) {
  // Navigation helpers
  const goToNext = useCallback(() => {
    const steps: StepType[] = ['source', 'type', 'configuration', 'templates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep, setCurrentStep]);
  
  const goToPrevious = useCallback(() => {
    const steps: StepType[] = ['source', 'type', 'configuration', 'templates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep, setCurrentStep]);

  return {
    goToNext,
    goToPrevious
  };
}
