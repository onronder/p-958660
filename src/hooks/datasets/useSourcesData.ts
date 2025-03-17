
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Source } from "@/types/source";

/**
 * Hook for fetching and managing data sources
 */
export const useSourcesData = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load sources when the component mounts
  useEffect(() => {
    const loadSources = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSources();
  }, []);
  
  return {
    sources,
    isLoading
  };
};
