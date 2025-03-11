
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Source } from "@/types/source";
import { fetchDeletedSources, restoreSource } from "@/services/sourcesService";
import { useAuth } from "@/contexts/AuthContext";

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
      
      const sourcesData = await fetchDeletedSources(user.id);
      setDeletedSources(sourcesData);
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
      await restoreSource(sourceId);
      
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
