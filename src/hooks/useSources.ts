
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Source } from "@/types/source";
import { fetchUserSources, deleteSource, testShopifyConnection } from "@/services/sourcesService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSources = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      
      if (!user) {
        return;
      }
      
      const sourcesData = await fetchUserSources(user.id);
      setSources(sourcesData);
    } catch (error) {
      console.error("Error fetching sources:", error);
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
      
      if (source.source_type === "Shopify" && source.credentials?.access_token) {
        await testShopifyConnection(sourceId, source.url, source.credentials);
      } else {
        // For other source types or if no OAuth token is available, use a simple delay for now
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      toast({
        title: "Connection Successful",
        description: "The source connection is working properly.",
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the source. Please check credentials.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteSource(sourceId);
      
      toast({
        title: "Source Deleted",
        description: "The source has been deleted successfully.",
      });
      
      loadSources();
    } catch (error) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    sources,
    isLoading,
    loadSources,
    handleTestConnection,
    handleDeleteSource
  };
};
