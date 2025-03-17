
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | undefined>(undefined);

  /**
   * Test connection to the source
   */
  const testConnection = useCallback(async () => {
    if (!sourceId) {
      setError("Please select a source first");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke("shopify-extract", {
        body: {
          extraction_id: "preview",
          source_id: sourceId,
          custom_query: `
            query {
              shop {
                name
                myshopifyDomain
              }
            }
          `,
          preview_only: true,
          limit: 1
        }
      });

      if (functionError) {
        console.error("Connection test error:", functionError);
        setConnectionTestResult({
          success: false,
          message: functionError.message || "Connection failed. Please check your credentials and try again."
        });
        return;
      }

      if (data.error) {
        console.error("Connection test API error:", data.error);
        setConnectionTestResult({
          success: false,
          message: data.error || "Connection failed. Please check your credentials and try again."
        });
        return;
      }

      console.log("Connection test successful:", data);
      setConnectionTestResult({
        success: true,
        message: "Successfully connected to Shopify store."
      });
      
    } catch (err: any) {
      console.error("Connection test exception:", err);
      setConnectionTestResult({
        success: false,
        message: err.message || "Connection failed. Please check your credentials and try again."
      });
    } finally {
      setIsLoading(false);
    }
  }, [sourceId]);

  /**
   * Generate a preview based on the dataset type and settings
   */
  const generatePreview = useCallback(async () => {
    // Get effective values, trying backup values from session storage if needed
    const effectiveSourceId = sourceId || JSON.parse(sessionStorage.getItem('dataset_sourceId_backup') || 'null');
    const effectiveDatasetType = datasetType || JSON.parse(sessionStorage.getItem('dataset_datasetType_backup') || 'null');
    const effectiveTemplateName = templateName || JSON.parse(sessionStorage.getItem('dataset_templateName_backup') || 'null');
    const effectiveCustomQuery = customQuery || JSON.parse(sessionStorage.getItem('dataset_customQuery_backup') || 'null');
    
    console.log("GeneratePreview called with:", {
      effectiveSourceId,
      effectiveDatasetType,
      effectiveTemplateName,
      effectiveCustomQuery
    });
    
    if (!effectiveSourceId) {
      setError("Please select a source first");
      return;
    }

    // Check if we have the necessary data based on dataset type
    if (effectiveDatasetType === "predefined" || effectiveDatasetType === "dependent") {
      if (!effectiveTemplateName) {
        setError("Please select a template");
        return;
      }
    } else if (effectiveDatasetType === "custom") {
      if (!effectiveCustomQuery) {
        setError("Please enter a custom query");
        return;
      }
    } else {
      setError("Please select a dataset type");
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
      
      // Build the request body based on dataset type
      let queryBody: any = {
        extraction_id: "preview",
        source_id: effectiveSourceId,
        preview_only: true,
        limit: 5
      };
      
      if (effectiveDatasetType === "custom") {
        queryBody.custom_query = effectiveCustomQuery;
      } else if (effectiveDatasetType === "predefined" || effectiveDatasetType === "dependent") {
        if (effectiveDatasetType === "dependent") {
          const { data, error: functionError } = await supabase.functions.invoke("shopify-dependent", {
            body: {
              ...queryBody,
              template_name: effectiveTemplateName
            }
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
          return;
        } else {
          // For predefined queries
          const { data, error: functionError } = await supabase.functions.invoke("shopify-extract", {
            body: {
              ...queryBody,
              template_name: effectiveTemplateName,
              extraction_type: "predefined"
            }
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
          return;
        }
      }
      
      // Default case for direct custom query
      const { data, error: functionError } = await supabase.functions.invoke("shopify-extract", {
        body: queryBody
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
    isLoading,
    error,
    generatePreview,
    testConnection,
    connectionTestResult
  };
};
