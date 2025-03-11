
import { useDestinationsQuery, useFilteredDestinations } from "./useDestinationsQuery";
import { useDestinationsStatus } from "./useDestinationsStatus";
import { useOAuthFlow } from "./useOAuthFlow";
import { useDeleteDestination } from "./useDeleteDestination";
import { useTestConnection } from "./useTestConnection";
import { useExportDestination } from "./useExportDestination";
import { useAddDestination } from "./useAddDestination";
import { useRestoreDestination } from "./useRestoreDestination";
import { useUpdateDestination } from "./useUpdateDestination";
import { useRetryExport } from "./useRetryExport";
import { useToast } from "@/hooks/use-toast";

export const useDestinationsHook = () => {
  // Initialize toast
  const { toast } = useToast();
  
  // Use the extracted hooks
  const { selectedStatus, setSelectedStatus } = useDestinationsStatus();
  const { data, isLoading, error, refetch } = useDestinationsQuery();
  const filteredDestinations = useFilteredDestinations(data, selectedStatus);
  const { initiateOAuth, handleOAuthCallback } = useOAuthFlow();
  const deleteMutation = useDeleteDestination();
  const testConnectionMutation = useTestConnection();
  const exportMutation = useExportDestination();
  const restoreMutation = useRestoreDestination();
  const { handleAddDestination } = useAddDestination();
  const { handleUpdateDestination } = useUpdateDestination();
  const { handleRetryExport } = useRetryExport();

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
    restoreMutation,
    handleAddDestination: async (newDestination: any) => {
      try {
        const result = await handleAddDestination(newDestination);
        if (result) {
          toast({
            title: "Destination Added",
            description: `${newDestination.name} has been added successfully.`,
          });
          await refetch();
          return true;
        }
        return false;
      } catch (error) {
        toast({
          title: "Error Adding Destination",
          description: error instanceof Error ? error.message : "Failed to add destination",
          variant: "destructive",
        });
        return false;
      }
    },
    handleUpdateDestination: async (destination: any) => {
      try {
        const result = await handleUpdateDestination(destination);
        if (result) {
          toast({
            title: "Destination Updated",
            description: `${destination.name} has been updated successfully.`,
          });
          await refetch();
          return true;
        }
        return false;
      } catch (error) {
        toast({
          title: "Error Updating Destination",
          description: error instanceof Error ? error.message : "Failed to update destination",
          variant: "destructive",
        });
        return false;
      }
    },
    handleRestoreDestination: async (id: string) => {
      try {
        const destination = await restoreMutation.mutateAsync(id);
        if (destination) {
          toast({
            title: "Destination Restored",
            description: `${destination.name} has been restored successfully.`,
          });
          await refetch();
          return true;
        }
        return false;
      } catch (error) {
        toast({
          title: "Error Restoring Destination",
          description: error instanceof Error ? error.message : "Failed to restore destination",
          variant: "destructive",
        });
        return false;
      }
    },
    handleRetryExport,
    initiateOAuth,
    handleOAuthCallback,
    refetch
  };
};
