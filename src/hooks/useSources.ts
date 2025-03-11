
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Source } from "@/types/source";
import { fetchUserSources, deleteSource, testShopifyConnection } from "@/services/sourcesService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSources = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingSource, setIsDeletingSource] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSources();
    }
  }, [user]);

  const loadSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        return;
      }
      
      try {
        // First try using the sources edge function
        const sourcesData = await fetchUserSources(user.id);
        setSources(sourcesData);
      } catch (edgeFunctionError) {
        console.error("Error fetching sources from edge function:", edgeFunctionError);
        
        // Fallback to direct Supabase query
        console.log("Falling back to direct Supabase query for sources");
        
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_deleted', false);
          
        if (error) {
          throw error;
        }
        
        setSources(data || []);
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
      setError(error instanceof Error ? error : new Error("Failed to load sources"));
      toast({
        title: "Error",
        description: "Failed to load sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) {
      toast({
        title: "Error",
        description: "Source not found",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Testing connection...",
        description: "Please wait while we verify the connection.",
      });
      
      if (source.source_type === "Shopify") {
        await testShopifyConnection(sourceId, source.url, source.credentials);
        
        // Refresh sources to get updated status
        await loadSources();
        
        toast({
          title: "Connection Successful",
          description: "The source connection is working properly.",
        });
      } else {
        // For other source types, implement specific testing logic
        toast({
          title: "Source Type Not Supported",
          description: `Testing for ${source.source_type} is not implemented yet.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the source. Please check credentials.",
        variant: "destructive",
      });
      
      // Refresh sources to get updated status
      await loadSources();
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      setIsDeletingSource(true);
      
      try {
        // First try using the edge function
        await deleteSource(sourceId);
      } catch (edgeFunctionError) {
        console.error("Error deleting source with edge function:", edgeFunctionError);
        
        // Fallback to direct Supabase update
        console.log("Falling back to direct Supabase update for source deletion");
        
        const { error } = await supabase
          .from('sources')
          .update({ 
            is_deleted: true,
            deletion_marked_at: new Date().toISOString(),
            status: 'Deleted'
          })
          .eq('id', sourceId);
          
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Source Moved to Trash",
        description: "The source has been moved to the trash. It will be permanently deleted after 30 days.",
      });
      
      // Remove the deleted source from the current list
      setSources(sources.filter(source => source.id !== sourceId));
    } catch (error) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSource(false);
    }
  };

  return {
    sources,
    isLoading,
    isDeletingSource,
    error,
    loadSources,
    handleTestConnection,
    handleDeleteSource
  };
};
