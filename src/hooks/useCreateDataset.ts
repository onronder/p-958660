
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Source } from "@/types/source";

export const useCreateDataset = (onSuccess: (success?: boolean) => void) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [datasetType, setDatasetType] = useState<"predefined" | "dependent" | "custom">("predefined");
  const [templateName, setTemplateName] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [name, setName] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load sources when the component mounts
  useEffect(() => {
    const loadSources = async () => {
      try {
        const { data, error } = await supabase
          .from("sources")
          .select("*")
          .eq("source_type", "Shopify") // Currently only supporting Shopify
          .eq("is_deleted", false);
        
        if (error) {
          throw error;
        }
        
        setSources(data as Source[]);
      } catch (error) {
        console.error("Error loading sources:", error);
        toast({
          title: "Error",
          description: "Failed to load data sources",
          variant: "destructive",
        });
      }
    };
    
    loadSources();
  }, []);
  
  const resetState = useCallback(() => {
    setSourceId("");
    setSourceName("");
    setDatasetType("predefined");
    setTemplateName("");
    setCustomQuery("");
    setName("");
    setPreviewData([]);
  }, []);
  
  const generatePreview = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Create a temporary extraction record for preview
      const { data: extraction, error: extractionError } = await supabase
        .from("extractions")
        .insert({
          name: "Preview Dataset",
          user_id: user.id,  // Add user_id here
          source_id: sourceId,
          extraction_type: datasetType,
          template_name: datasetType === "custom" ? null : templateName,
          custom_query: datasetType === "custom" ? customQuery : null,
          status: "pending"
        })
        .select()
        .single();
      
      if (extractionError || !extraction) {
        throw new Error("Failed to create preview extraction");
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
      
      // Set preview data
      setPreviewData(data.results || []);
      
      // Clean up temporary extraction
      await supabase
        .from("extractions")
        .delete()
        .eq("id", extraction.id);
      
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate preview: " + error.message,
        variant: "destructive",
      });
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  }, [sourceId, datasetType, templateName, customQuery]);
  
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
          user_id: user.id,  // Add user_id here
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
    } catch (error) {
      console.error("Error creating dataset:", error);
      toast({
        title: "Error",
        description: "Failed to create dataset: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, sourceId, sourceName, datasetType, templateName, customQuery, onSuccess]);
  
  return {
    sources,
    sourceId,
    sourceName,
    datasetType,
    templateName,
    customQuery,
    name,
    previewData,
    isLoading,
    isSubmitting,
    setSourceId,
    setSourceName,
    setDatasetType,
    setTemplateName,
    setCustomQuery,
    setName,
    setPreviewData,
    generatePreview,
    createDataset,
    resetState
  };
};
