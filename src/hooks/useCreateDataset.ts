
import { useDatasetState } from "./datasets/useDatasetState";
import { useSourcesData } from "./datasets/useSourcesData";
import { useDatasetPreview } from "./datasets/useDatasetPreview";
import { useDatasetCreation } from "./datasets/useDatasetCreation";

/**
 * Main hook that combines all dataset-related functionality
 */
export const useCreateDataset = (onSuccess: (success?: boolean) => void) => {
  // Get dataset state
  const {
    sourceId,
    sourceName,
    datasetType,
    templateName,
    customQuery,
    name,
    previewData,
    setSourceId,
    setSourceName,
    setDatasetType,
    setTemplateName,
    setCustomQuery,
    setName,
    setPreviewData,
    resetState
  } = useDatasetState();
  
  // Get sources data
  const { sources } = useSourcesData();
  
  // Get preview functionality
  const { 
    isLoading, 
    error, 
    generatePreview,
    testConnection,
    connectionTestResult
  } = useDatasetPreview(
    sourceId,
    datasetType,
    templateName,
    customQuery,
    setPreviewData
  );
  
  // Get creation functionality
  const { isSubmitting, createDataset } = useDatasetCreation(
    name,
    sourceId,
    datasetType,
    templateName,
    customQuery,
    onSuccess
  );
  
  // Handle source selection
  const handleSourceSelect = (id: string, name: string) => {
    console.log("useCreateDataset: Setting source", id, name);
    setSourceId(id);
    setSourceName(name);
  };
  
  // Handle dataset type selection
  const handleTypeSelect = (type: "predefined" | "dependent" | "custom") => {
    console.log("useCreateDataset: Setting dataset type", type);
    setDatasetType(type);
  };
  
  return {
    // Source state
    sources,
    sourceId,
    sourceName,
    setSourceId,
    setSourceName,
    handleSourceSelect,
    
    // Dataset type
    datasetType,
    setDatasetType,
    handleTypeSelect,
    
    // Template/query
    templateName,
    setTemplateName,
    customQuery,
    setCustomQuery,
    
    // Dataset metadata
    name,
    setName,
    
    // Preview data
    previewData,
    setPreviewData,
    
    // Error state
    error,
    
    // Loading states
    isLoading,
    isSubmitting,
    
    // Connection test
    testConnection,
    connectionTestResult,
    
    // Actions
    generatePreview,
    createDataset,
    resetState
  };
};
