
import React from 'react';
import { StepType } from '@/hooks/datasets/useCreateDatasetState';

interface WizardNavigationProps {
  currentStep: StepType;
  datasetType: 'predefined' | 'dependent' | 'custom';
  selectedSourceId: string;
  datasetName: string;
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
  
  checkCanProceed: () => boolean;
}

export const useWizardNavigation = ({
  currentStep,
  datasetType,
  selectedSourceId,
  datasetName,
  selectedTemplate,
  selectedDependentTemplate,
  customQuery
}: WizardNavigationProps) => {
  // Check if we can proceed to the next step
  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 'source':
        return !!selectedSourceId;
      case 'type':
        return !!datasetType;
      case 'configuration':
        return !!datasetName;
      case 'templates':
        if (datasetType === 'predefined') return !!selectedTemplate;
        if (datasetType === 'dependent') return !!selectedDependentTemplate;
        if (datasetType === 'custom') return !!customQuery;
        return false;
      default:
        return true;
    }
  };

  return {
    canProceedToNext
  };
};
