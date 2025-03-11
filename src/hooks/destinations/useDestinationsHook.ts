
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

export const useDestinationsHook = () => {
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
    handleAddDestination,
    handleUpdateDestination,
    handleRestoreDestination: async (id: string) => {
      try {
        await restoreMutation.mutateAsync(id);
        return true;
      } catch (error) {
        console.error("Error restoring destination:", error);
        return false;
      }
    },
    handleRetryExport,
    initiateOAuth,
    handleOAuthCallback,
    refetch
  };
};
