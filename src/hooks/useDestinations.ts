
import { useDestinationsHook } from "./destinations/useDestinationsHook";

// Re-export the hook for backward compatibility
export const useDestinations = useDestinationsHook;

// Re-export type
export type { Destination } from "./destinations/types";
