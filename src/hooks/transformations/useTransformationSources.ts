
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Source } from "@/types/source";

export const useTransformationSources = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  // Load available data sources
  const loadSources = async () => {
    setIsLoadingSources(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-sources", {
        method: "GET"
      });
      
      if (error) throw error;
      setSources(data?.sources || []);
      return data?.sources || [];
    } catch (error) {
      console.error("Error loading sources:", error);
      toast({
        title: "Error",
        description: "Failed to load data sources.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingSources(false);
    }
  };

  return {
    sources,
    isLoadingSources,
    loadSources
  };
};
