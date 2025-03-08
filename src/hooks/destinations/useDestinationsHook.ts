
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useOAuthFlow } from "./useOAuthFlow";
import { fetchDestinations } from "./destinationApi";
import { useDeleteDestination } from "./useDeleteDestination";
import { useTestConnection } from "./useTestConnection";
import { useExportDestination } from "./useExportDestination";
import { useAddDestination } from "./useAddDestination";
import { Destination } from "./types";

export const useDestinationsHook = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const { initiateOAuth, handleOAuthCallback } = useOAuthFlow();
  
  // Use the extracted hooks
  const deleteMutation = useDeleteDestination();
  const testConnectionMutation = useTestConnection();
  const exportMutation = useExportDestination();
  const { handleAddDestination } = useAddDestination();

  // Fetch destinations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    enabled: !!user, // Only run if user is logged in
    refetchInterval: 30000, // Polling every 30 seconds to refresh statuses
  });

  // Filter destinations by status if a filter is selected
  const filteredDestinations = selectedStatus
    ? data?.filter((dest) => dest.status === selectedStatus)
    : data;

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
