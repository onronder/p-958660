
import React from 'react';
import { StepType } from '@/hooks/datasets/state/types';
import { devLogger } from '@/utils/DevLogger';

interface WizardNavigationProps {
  currentStep: StepType;
  datasetType: 'predefined' | 'dependent' | 'custom';
  selectedSourceId: string;
  datasetName: string;
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
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
    let canProceed = false;

    switch (currentStep) {
      case 'source':
        canProceed = !!selectedSourceId;
        break;
      case 'type':
        canProceed = !!datasetType;
        break;
      case 'configuration':
        canProceed = !!datasetName && !!selectedSourceId;
        break;
      case 'templates':
        if (datasetType === 'predefined') {
          canProceed = !!selectedTemplate;
        } else if (datasetType === 'dependent') {
          canProceed = !!selectedDependentTemplate;
        } else if (datasetType === 'custom') {
          canProceed = !!customQuery && customQuery.trim().length > 0;
        }
        break;
      default:
        canProceed = true;
        break;
    }

    // Log validation results for debugging
    devLogger.debug('WizardNavigation', `Step validation for ${currentStep}`, {
      canProceed,
      datasetType,
      hasSourceId: !!selectedSourceId,
      hasName: !!datasetName,
      hasTemplate: !!selectedTemplate,
      hasDependentTemplate: !!selectedDependentTemplate, 
      hasCustomQuery: !!customQuery
    });

    return canProceed;
  };

  return {
    canProceedToNext
  };
};
