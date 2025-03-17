
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
    
    // Ensure we update both state variables
    setSourceId(id);
    setSourceName(name);
    
    // Also store as direct backup in session storage
    sessionStorage.setItem('dataset_sourceId_backup', id);
    sessionStorage.setItem('dataset_sourceName_backup', name);
    
    // Log the state after setting
    setTimeout(() => {
      console.log("useCreateDataset: Source state after update:", { 
        sourceId: id, 
        sourceName: name,
        storedSourceId: sessionStorage.getItem('dataset_sourceId'),
        backupSourceId: sessionStorage.getItem('dataset_sourceId_backup')
      });
    }, 0);
  };
  
  // Handle dataset type selection
  const handleTypeSelect = (type: "predefined" | "dependent" | "custom") => {
    console.log("useCreateDataset: Setting dataset type", type);
    
    setDatasetType(type);
    
    // Set appropriate default tab for details page based on type
    if (type === "predefined" || type === "dependent") {
      setTemplateName("");  // Reset template when changing type
    } else if (type === "custom") {
      setCustomQuery("");  // Reset custom query when changing to custom
    }
    
    // Also store as direct backup in session storage
    sessionStorage.setItem('dataset_datasetType_backup', type);
    
    // Log the state after setting
    setTimeout(() => {
      console.log("useCreateDataset: Dataset type after update:", { 
        datasetType: type,
        storedDatasetType: sessionStorage.getItem('dataset_datasetType'),
        backupDatasetType: sessionStorage.getItem('dataset_datasetType_backup')
      });
    }, 0);
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
