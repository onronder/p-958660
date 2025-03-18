
import { useEffect } from 'react';
import { DatasetState } from './types';

export function useDatasetStatePersistence(
  state: Partial<DatasetState>,
  setters: {
    setCurrentStep: (value: any) => void;
    setDatasetType: (value: any) => void;
    setSelectedSourceId: (value: any) => void;
    setDatasetName: (value: any) => void;
    setSelectedTemplate: (value: any) => void;
    setSelectedDependentTemplate: (value: any) => void;
    setCustomQuery: (value: any) => void;
  }
) {
  // Parse saved state from sessionStorage on component mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('createDatasetState');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Restore saved state
        if (parsedState.currentStep) setters.setCurrentStep(parsedState.currentStep);
        if (parsedState.datasetType) setters.setDatasetType(parsedState.datasetType);
        if (parsedState.selectedSourceId) setters.setSelectedSourceId(parsedState.selectedSourceId);
        if (parsedState.datasetName) setters.setDatasetName(parsedState.datasetName);
        if (parsedState.selectedTemplate) setters.setSelectedTemplate(parsedState.selectedTemplate);
        if (parsedState.selectedDependentTemplate) setters.setSelectedDependentTemplate(parsedState.selectedDependentTemplate);
        if (parsedState.customQuery) setters.setCustomQuery(parsedState.customQuery);
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
      currentStep: state.currentStep,
      datasetType: state.datasetType,
      selectedSourceId: state.selectedSourceId,
      datasetName: state.datasetName,
      selectedTemplate: state.selectedTemplate,
      selectedDependentTemplate: state.selectedDependentTemplate,
      customQuery: state.customQuery
    };
    
    try {
      sessionStorage.setItem('createDatasetState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving dataset creation state:", error);
    }
  }, [
    state.currentStep,
    state.datasetType,
    state.selectedSourceId,
    state.datasetName,
    state.selectedTemplate,
    state.selectedDependentTemplate,
    state.customQuery
  ]);
}
