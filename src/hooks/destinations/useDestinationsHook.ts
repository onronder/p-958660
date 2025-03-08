
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOAuthFlow } from "./useOAuthFlow";
import { Destination } from "./types";
import { 
  fetchDestinations, 
  deleteDestination, 
  testConnection,
  exportToDestination,
  addDestination
} from "./destinationApi";

export const useDestinationsHook = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { initiateOAuth, handleOAuthCallback } = useOAuthFlow();

  // Fetch destinations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    enabled: !!user, // Only run if user is logged in
    refetchInterval: 30000, // Polling every 30 seconds to refresh statuses
  });

  // Delete destination mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast({
        title: "Destination deleted",
        description: "The destination has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete destination.",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: testConnection,
    onSuccess: (data) => {
      toast({
        title: "Connection test successful",
        description: data.message || "The destination connection is working properly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection test failed",
        description: error.message || "Failed to connect to destination.",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: exportToDestination,
    onSuccess: (data) => {
      toast({
        title: "Export started",
        description: "The export process has been started. You'll be notified when it completes.",
      });
      // Refetch after a few seconds to see status update
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["destinations"] }), 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to start export process.",
        variant: "destructive",
      });
    },
  });

  // Filter destinations by status if a filter is selected
  const filteredDestinations = selectedStatus
    ? data?.filter((dest) => dest.status === selectedStatus)
    : data;

  // Add a new destination
  const handleAddDestination = async (newDestination: any) => {
    try {
      await addDestination(newDestination);
      
      toast({
        title: "Destination added",
        description: `${newDestination.name} has been added successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add destination",
        variant: "destructive",
      });
      return false;
    }
  };

  // Retry failed export
  const handleRetryExport = (id: string) => {
    exportMutation.mutate(id);
  };

  return {
    destinations: data,
    filteredDestinations,
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    deleteMutation,
    testConnectionMutation,
    exportMutation,
    handleAddDestination,
    handleRetryExport,
    initiateOAuth,
    handleOAuthCallback
  };
};
