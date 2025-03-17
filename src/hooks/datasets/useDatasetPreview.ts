
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Hook for generating dataset previews
 */
export const useDatasetPreview = (
  sourceId: string,
  datasetType: "predefined" | "dependent" | "custom",
  templateName: string,
  customQuery: string,
  setPreviewData: (data: any[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generatePreview = useCallback(async () => {
    try {
      // Clear previous errors
      setError(null);
      
      // Validate source ID
      if (!sourceId) {
        console.error("Missing sourceId when generating preview");
        throw new Error("No source selected. Please select a source first.");
      }
      
      setIsLoading(true);
      console.log("Generating preview for source:", sourceId, "type:", datasetType);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      // Create a temporary extraction record for preview
      const { data: extraction, error: extractionError } = await supabase
        .from("extractions")
        .insert({
          name: "Preview Dataset",
          user_id: session.user.id,
          source_id: sourceId,
          extraction_type: datasetType,
          template_name: datasetType === "custom" ? null : templateName,
          custom_query: datasetType === "custom" ? customQuery : null,
          status: "pending"
        })
        .select()
        .single();
      
      if (extractionError || !extraction) {
        console.error("Failed to create preview extraction:", extractionError);
        throw new Error("Failed to create preview extraction");
      }
      
      console.log("Created preview extraction with ID:", extraction.id);
      
      // Determine which endpoint to use based on extraction type
      const endpoint = datasetType === "dependent"
        ? "shopify-dependent"
        : "shopify-extract";
      
      console.log("Calling edge function:", endpoint);
      
      // Call the appropriate edge function with preview flag
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          extraction_id: extraction.id,
          preview_only: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate preview");
      }
      
      const data = await response.json();
      console.log("Preview data received:", data);
      
      // Set preview data
      setPreviewData(data.results || []);
      
      // Clean up temporary extraction
      await supabase
        .from("extractions")
        .delete()
        .eq("id", extraction.id);
      
    } catch (error) {
      console.error("Error generating preview:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to generate preview: " + error.message,
        variant: "destructive",
      });
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  }, [sourceId, datasetType, templateName, customQuery, setPreviewData]);
  
  return {
    isLoading,
    error,
    generatePreview
  };
};
