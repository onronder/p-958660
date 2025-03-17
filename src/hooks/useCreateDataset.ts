
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
  const { isLoading, generatePreview } = useDatasetPreview(
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
  
  return {
    // Source state
    sources,
    sourceId,
    sourceName,
    setSourceId,
    setSourceName,
    
    // Dataset type
    datasetType,
    setDatasetType,
    
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
    
    // Loading states
    isLoading,
    isSubmitting,
    
    // Actions
    generatePreview,
    createDataset,
    resetState
  };
};
