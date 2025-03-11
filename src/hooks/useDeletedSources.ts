
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
  const { toast } = useToast();
  const { user } = useAuth();

  const loadDeletedSources = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        return;
      }
      
      try {
        // First try using the edge function
        const sourcesData = await fetchDeletedSources(user.id);
        setDeletedSources(sourcesData);
      } catch (edgeFunctionError) {
        console.error("Error fetching deleted sources from edge function:", edgeFunctionError);
        
        // Fallback to direct Supabase query if the edge function fails
        console.log("Falling back to direct Supabase query for deleted sources");
        
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_deleted', true);
          
        if (error) {
          throw error;
        }
        
        // Convert the data to match the expected format
        const formattedSources = data?.map(source => ({
          ...source,
          status: "Deleted" as any
        })) || [];
        
        setDeletedSources(formattedSources);
      }
    } catch (error) {
      console.error("Error fetching deleted sources:", error);
      toast({
        title: "Error",
        description: "Failed to load deleted sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDeletedSources();
    }
  }, [user]);

  const handleRestoreSource = async (sourceId: string) => {
    try {
      setIsRestoring(true);
      
      try {
        // First try using the edge function
        await restoreSource(sourceId);
      } catch (edgeFunctionError) {
        console.error("Error restoring source with edge function:", edgeFunctionError);
        
        // Fallback to direct Supabase query
        console.log("Falling back to direct Supabase update for restoring source");
        
        const { error } = await supabase
          .from('sources')
          .update({ 
            is_deleted: false,
            deletion_marked_at: null,
            status: 'Inactive'
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
      
      // Refresh the list after restoration
      loadDeletedSources();
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

  return {
    deletedSources,
    isLoading,
    isRestoring,
    loadDeletedSources,
    handleRestoreSource
  };
};
