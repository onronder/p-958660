
import { useState, useEffect } from 'react';

// Step types
export type StepType = 'source' | 'type' | 'configuration' | 'templates' | 'preview';

export interface CreateDatasetState {
  currentStep: StepType;
  datasetType: 'predefined' | 'dependent' | 'custom';
  selectedSourceId: string;
  selectedSourceName: string;
  selectedSourceType: string;
  datasetName: string;
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
  previewData: any[];
  previewError: string | null;
  isPreviewLoading: boolean;
  connectionTestResult?: { success: boolean; message: string };
}

export function useCreateDatasetState() {
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

  // Parse saved state from sessionStorage on component mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('createDatasetState');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Restore saved state
        if (parsedState.currentStep) setCurrentStep(parsedState.currentStep as StepType);
        if (parsedState.datasetType) setDatasetType(parsedState.datasetType);
        if (parsedState.selectedSourceId) setSelectedSourceId(parsedState.selectedSourceId);
        if (parsedState.datasetName) setDatasetName(parsedState.datasetName);
        if (parsedState.selectedTemplate) setSelectedTemplate(parsedState.selectedTemplate);
        if (parsedState.selectedDependentTemplate) setSelectedDependentTemplate(parsedState.selectedDependentTemplate);
        if (parsedState.customQuery) setCustomQuery(parsedState.customQuery);
      }
    } catch (error) {
      console.error("Error parsing saved dataset creation state:", error);
      // Clear corrupted state
      sessionStorage.removeItem('createDatasetState');
    }
  }, []);
  
  // Save current state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      currentStep,
      datasetType,
      selectedSourceId,
      datasetName,
      selectedTemplate,
      selectedDependentTemplate,
      customQuery
    };
    
    try {
      sessionStorage.setItem('createDatasetState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving dataset creation state:", error);
    }
  }, [
    currentStep,
    datasetType,
    selectedSourceId,
    datasetName,
    selectedTemplate,
    selectedDependentTemplate,
    customQuery
  ]);

  // Navigation helpers
  const goToNext = () => {
    const steps: StepType[] = ['source', 'type', 'configuration', 'templates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };
  
  const goToPrevious = () => {
    const steps: StepType[] = ['source', 'type', 'configuration', 'templates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

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
