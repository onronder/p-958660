
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDestinations } from "./api";
import { Destination } from "./types";

/**
 * Hook for fetching destinations data
 */
export const useDestinationsQuery = () => {
  const { user } = useAuth();

  // Fetch destinations
  return useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    enabled: !!user, // Only run if user is logged in
    refetchInterval: 30000, // Polling every 30 seconds to refresh statuses
  });
};

/**
 * Hook for filtering destinations by status
 */
export const useFilteredDestinations = (
  destinations: Destination[] | undefined,
  selectedStatus: string | null
) => {
  // Filter destinations by status if a filter is selected
  return selectedStatus
    ? destinations?.filter((dest) => dest.status === selectedStatus)
    : destinations;
};
