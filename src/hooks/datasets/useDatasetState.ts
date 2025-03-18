
import { useDatasetStateCore } from "./state/useDatasetStateCore";

/**
 * Hook for managing dataset creation state with session storage persistence
 */
export const useDatasetState = () => {
  // Use the core state management hook
  const state = useDatasetStateCore();
  
  return {
    // Source info
    sourceId: state.sourceId,
    sourceName: state.sourceName,
    setSourceId: state.setSourceId,
    setSourceName: state.setSourceName,
    
    // Dataset type
    datasetType: state.datasetType,
    setDatasetType: state.setDatasetType,
    
    // Template/query
    templateName: state.templateName,
    setTemplateName: state.setTemplateName,
    customQuery: state.customQuery,
    setCustomQuery: state.setCustomQuery,
    
    // Dataset metadata
    name: state.name,
    setName: state.setName,
    
    // Preview data
    previewData: state.previewData,
    setPreviewData: state.setPreviewData,
    
    // Reset function
    resetState: state.resetState
  };
};
