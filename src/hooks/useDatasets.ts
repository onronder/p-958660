
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { toast } from "@/hooks/use-toast";

export const useDatasets = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const loadDatasets = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      const { data, error } = await supabase
        .from("extractions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setDatasets(data as Dataset[]);
    } catch (error) {
      console.error("Error loading datasets:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to load datasets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteDataset = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("extractions")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      setDatasets(prev => prev.filter(dataset => dataset.id !== id));
      
      toast({
        title: "Dataset deleted",
        description: "The dataset has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting dataset:", error);
      toast({
        title: "Error",
        description: "Failed to delete dataset",
        variant: "destructive",
      });
    }
  }, []);
  
  const runDataset = useCallback(async (id: string) => {
    try {
      // First, update the dataset status
      await supabase
        .from("extractions")
        .update({
          status: "pending",
          progress: 0,
          status_message: "Waiting to start...",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      // Update local state
      setDatasets(prev => 
        prev.map(dataset => 
          dataset.id === id 
            ? { 
                ...dataset, 
                status: "pending", 
                progress: 0,
                status_message: "Waiting to start..."
              } 
            : dataset
        )
      );
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      // Get the dataset to determine the extraction type
      const { data: dataset, error: datasetError } = await supabase
        .from("extractions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (datasetError || !dataset) {
        throw new Error("Failed to get dataset details");
      }
      
      // Determine which endpoint to use based on extraction type
      const endpoint = dataset.extraction_type === "dependent"
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
          extraction_id: id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run dataset extraction");
      }
      
      toast({
        title: "Dataset extraction started",
        description: "The extraction has been started and will update when complete",
      });
      
      // Reload datasets to get updated status
      loadDatasets();
    } catch (error) {
      console.error("Error running dataset:", error);
      
      // Update dataset status to failed
      await supabase
        .from("extractions")
        .update({
          status: "failed",
          status_message: error.message || "An unknown error occurred",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      toast({
        title: "Error",
        description: "Failed to run dataset extraction",
        variant: "destructive",
      });
      
      // Reload datasets to get updated status
      loadDatasets();
    }
  }, [loadDatasets]);
  
  return {
    datasets,
    isLoading,
    isError,
    loadDatasets,
    deleteDataset,
    runDataset
  };
};
