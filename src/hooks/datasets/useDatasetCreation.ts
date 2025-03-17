
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Hook for handling dataset creation
 */
export const useDatasetCreation = (
  name: string,
  sourceId: string,
  datasetType: "predefined" | "dependent" | "custom",
  templateName: string,
  customQuery: string,
  onSuccess: (success?: boolean) => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createDataset = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Create the extraction record
      const { data: extraction, error: extractionError } = await supabase
        .from("extractions")
        .insert({
          name,
          user_id: user.id,
          source_id: sourceId,
          extraction_type: datasetType,
          template_name: datasetType === "custom" ? null : templateName,
          custom_query: datasetType === "custom" ? customQuery : null,
          status: "pending"
        })
        .select()
        .single();
      
      if (extractionError || !extraction) {
        throw new Error("Failed to create dataset");
      }
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      // Determine which endpoint to use based on extraction type
      const endpoint = datasetType === "dependent"
        ? "shopify-dependent"
        : "shopify-extract";
      
      // Call the appropriate edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          extraction_id: extraction.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run dataset extraction");
      }
      
      toast({
        title: "Dataset created",
        description: "Your dataset has been created and the extraction has started",
      });
      
      onSuccess(true);
      return true;
    } catch (error) {
      console.error("Error creating dataset:", error);
      toast({
        title: "Error",
        description: "Failed to create dataset: " + error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [name, sourceId, datasetType, templateName, customQuery, onSuccess]);
  
  return {
    isSubmitting,
    createDataset
  };
};
