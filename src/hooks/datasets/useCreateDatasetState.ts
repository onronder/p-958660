
import { useState, useEffect } from 'react';
import { StepType, UseDatasetStateReturn } from './state/types';
import { useDatasetNavigation } from './state/useDatasetNavigation';
import { useDatasetStatePersistence } from './state/useDatasetStatePersistence';

export type { StepType } from './state/types';

export function useCreateDatasetState(): UseDatasetStateReturn {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<StepType>('source');
  const [datasetType, setDatasetType] = useState<'predefined' | 'dependent' | 'custom'>('predefined');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedSourceName, setSelectedSourceName] = useState<string>('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');
  const [datasetName, setDatasetName] = useState<string>('');
  
  // Templates state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedDependentTemplate, setSelectedDependentTemplate] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  
  // Preview state
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{success: boolean; message: string} | undefined>(undefined);

  // Navigation
  const { goToNext, goToPrevious } = useDatasetNavigation(currentStep, setCurrentStep);

  // Persistence
  useDatasetStatePersistence(
    {
      currentStep,
      datasetType,
      selectedSourceId,
      datasetName,
      selectedTemplate,
      selectedDependentTemplate,
      customQuery
    },
    {
      setCurrentStep,
      setDatasetType,
      setSelectedSourceId,
      setDatasetName,
      setSelectedTemplate,
      setSelectedDependentTemplate,
      setCustomQuery
    }
  );

  // Update source data when source ID changes
  useEffect(() => {
    if (selectedSourceId && selectedSourceType === '') {
      // This would typically fetch the source details, but we'll handle it in the parent component
    }
  }, [selectedSourceId, selectedSourceType]);

  return {
    // State
    currentStep, setCurrentStep,
    datasetType, setDatasetType,
    selectedSourceId, setSelectedSourceId,
    selectedSourceName, setSelectedSourceName,
    selectedSourceType, setSelectedSourceType,
    datasetName, setDatasetName,
    selectedTemplate, setSelectedTemplate,
    selectedDependentTemplate, setSelectedDependentTemplate,
    customQuery, setCustomQuery,
    previewData, setPreviewData,
    previewError, setPreviewError,
    isPreviewLoading, setIsPreviewLoading,
    connectionTestResult, setConnectionTestResult,
    
    // Navigation
    goToNext,
    goToPrevious
  };
}
