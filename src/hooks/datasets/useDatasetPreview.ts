
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useDatasetPreview = (
  sourceId: string,
  datasetType: "predefined" | "dependent" | "custom",
  templateName: string,
  customQuery: string,
  setPreviewData: (data: any[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | undefined>(undefined);

  const testConnection = useCallback(async () => {
    if (!sourceId) {
      toast({
        title: "No source selected",
        description: "Please select a data source first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: testError } = await supabase.functions.invoke("shopify-schema", {
        body: { 
          source_id: sourceId,
          test_only: true
        }
      });
      
      if (testError || (data && data.error)) {
        const errorMessage = testError?.message || data?.error || "Failed to connect to GraphQL API";
        setConnectionTestResult({
          success: false,
          message: errorMessage
        });
        
        toast({
          title: "Connection Test Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      setConnectionTestResult({
        success: true,
        message: "Successfully connected to the Shopify GraphQL API"
      });
      
      toast({
        title: "Connection Test Successful",
        description: "Successfully connected to the Shopify GraphQL API",
      });
    } catch (err) {
      console.error("Error testing connection:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      
      setConnectionTestResult({
        success: false,
        message: errorMessage
      });
      
      toast({
        title: "Connection Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sourceId]);

  const generatePreview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate that we have a source ID
      if (!sourceId) {
        setError("No source selected. Please select a data source first.");
        return;
      }
      
      // Check that we have the necessary parameters based on dataset type
      if ((datasetType === "predefined" || datasetType === "dependent") && !templateName) {
        setError("No template selected. Please select a template first.");
        return;
      }
      
      if (datasetType === "custom" && !customQuery) {
        setError("No query provided. Please enter a custom query.");
        return;
      }
      
      // Prepare the request payload based on the dataset type
      let endpoint, payload;
      
      if (datasetType === "predefined") {
        endpoint = "shopify-extract";
        payload = {
          source_id: sourceId,
          template_name: templateName,
          preview_only: true
        };
      } else if (datasetType === "dependent") {
        endpoint = "shopify-dependent";
        payload = {
          source_id: sourceId,
          extraction_id: templateName, // In dependent queries, templateName is used as extraction_id
          preview_only: true
        };
      } else {
        endpoint = "shopify-extract";
        payload = {
          source_id: sourceId,
          custom_query: customQuery,
          preview_only: true
        };
      }
      
      console.log("Generating preview with payload:", payload);
      
      // Call the appropriate endpoint to get preview data
      const { data, error: previewError } = await supabase.functions.invoke(endpoint, {
        body: payload
      });
      
      if (previewError) {
        console.error("Preview error:", previewError);
        setError(previewError.message || "Failed to generate preview.");
        return;
      }
      
      if (data.error) {
        console.error("Preview data error:", data.error);
        setError(data.error);
        return;
      }
      
      // Set the preview data
      if (data.results) {
        console.log("Preview data received:", data.results);
        setPreviewData(data.results);
      } else {
        setError("No preview data returned.");
      }
    } catch (err) {
      console.error("Error generating preview:", err);
      setError("An unexpected error occurred while generating the preview.");
      
      toast({
        title: "Preview Generation Failed",
        description: "Could not generate dataset preview. Please try again.",
        variant: "destructive",
      });
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
