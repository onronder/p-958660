
import { useState, useCallback } from "react";
import { useConnectionTest } from "./preview/useConnectionTest";
import { fetchPreviewData } from "./preview/previewApiService";
import { validatePreviewParams, getEffectiveParams } from "./preview/previewValidation";

/**
 * Hook to handle dataset preview generation
 */
export const useDatasetPreview = (
  sourceId: string,
  datasetType: "predefined" | "dependent" | "custom" | undefined,
  templateName: string,
  customQuery: string,
  setPreviewData: (data: any[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the connection test hook
  const { 
    connectionTestResult, 
    testConnection,
    isLoading: isConnectionTesting 
  } = useConnectionTest(sourceId);

  /**
   * Generate a preview based on the dataset type and settings
   */
  const generatePreview = useCallback(async () => {
    // Get effective values
    const { 
      effectiveSourceId, 
      effectiveDatasetType, 
      effectiveTemplateName, 
      effectiveCustomQuery 
    } = getEffectiveParams({
      sourceId,
      datasetType,
      templateName, 
      customQuery
    });
    
    console.log("GeneratePreview called with:", {
      effectiveSourceId,
      effectiveDatasetType,
      effectiveTemplateName,
      effectiveCustomQuery
    });
    
    // Validate parameters
    const validation = validatePreviewParams({
      sourceId: effectiveSourceId,
      datasetType: effectiveDatasetType,
      templateName: effectiveTemplateName,
      customQuery: effectiveCustomQuery
    });
    
    if (!validation.isValid) {
      setError(validation.errorMessage || "Invalid parameters");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewData([]);
    
    try {
      console.log("Fetching preview data for:", {
        sourceId: effectiveSourceId,
        datasetType: effectiveDatasetType,
        templateName: effectiveTemplateName,
        customQuery: effectiveCustomQuery
      });
      
      // Make API request to fetch preview data
      const { data, error: functionError } = await fetchPreviewData({
        sourceId: effectiveSourceId,
        datasetType: effectiveDatasetType,
        templateName: effectiveTemplateName,
        customQuery: effectiveCustomQuery
      });
      
      if (functionError) {
        console.error("Preview error:", functionError);
        setError(functionError.message || "Failed to generate preview");
        return;
      }
      
      if (data.error) {
        console.error("Preview API error:", data.error);
        setError(data.error || "Failed to generate preview");
        return;
      }
      
      console.log("Preview data received:", data);
      setPreviewData(data.results || []);
      
    } catch (err: any) {
      console.error("Preview exception:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sourceId, datasetType, templateName, customQuery, setPreviewData]);

  return {
    isLoading: isLoading || isConnectionTesting,
    error,
    generatePreview,
    testConnection,
    connectionTestResult
  };
};
