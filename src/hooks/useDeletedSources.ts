
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Source } from "@/types/source";
import { fetchDeletedSources, restoreSource } from "@/services/sourcesService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useDeletedSources = () => {
  const [deletedSources, setDeletedSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadDeletedSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        return;
      }
      
      try {
        // First try using edge function
        const deletedSourcesData = await fetchDeletedSources(user.id);
        setDeletedSources(deletedSourcesData);
      } catch (edgeFunctionError) {
        console.info("Falling back to direct Supabase query for deleted sources");
        console.error("Error fetching deleted sources from edge function:", edgeFunctionError);
        
        // Fallback to direct Supabase query
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_deleted', true);
          
        if (error) {
          throw error;
        }
        
        // Make sure the display shows the source status correctly
        const formattedSources = data?.map(source => ({
          ...source,
          status: "Deleted" as "Deleted", // Display as deleted even if actual status is "Inactive"
        })) || [];
        
        setDeletedSources(formattedSources);
      }
    } catch (fetchError) {
      console.error("Error fetching deleted sources:", fetchError);
      setError(fetchError instanceof Error ? fetchError : new Error("Failed to load deleted sources"));
      toast({
        title: "Error",
        description: "Failed to load deleted sources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreSource = async (sourceId: string) => {
    try {
      setIsRestoring(true);
      
      try {
        // First try using edge function
        await restoreSource(sourceId);
      } catch (edgeFunctionError) {
        console.error("Error restoring source with edge function:", edgeFunctionError);
        
        // Fallback to direct Supabase update
        console.info("Falling back to direct Supabase update for source restoration");
        
        const { error } = await supabase
          .from('sources')
          .update({ 
            is_deleted: false,
            deletion_marked_at: null,
            status: 'Inactive'  // Set to Inactive when restoring (not "Active")
          })
          .eq('id', sourceId);
          
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Source Restored",
        description: "The source has been restored successfully.",
      });
      
      // Update the local state by removing the restored source
      setDeletedSources(prev => prev.filter(source => source.id !== sourceId));
    } catch (error) {
      console.error("Error restoring source:", error);
      toast({
        title: "Error",
        description: "Failed to restore source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDeletedSources();
    }
  }, [user]);

  return {
    deletedSources,
    isLoading,
    isRestoring,
    error,
    loadDeletedSources,
    handleRestoreSource
  };
};
