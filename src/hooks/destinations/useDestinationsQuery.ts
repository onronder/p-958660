
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDestinations } from "./api";
import { Destination } from "./types";

/**
 * Hook for fetching destinations data
 */
export const useDestinationsQuery = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch destinations
  return useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    enabled: !!user, // Only run if user is logged in
    refetchInterval: 30000, // Polling every 30 seconds to refresh statuses
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 10000, // Consider data fresh for 10 seconds
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error Loading Destinations",
          description: error.message || "Could not load destinations. Please try again later.",
          variant: "destructive",
        });
      }
    }
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
