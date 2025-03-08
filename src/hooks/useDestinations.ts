
import { useDestinationsHook } from "./destinations/useDestinationsHook";

// Re-export the hook for backward compatibility
export const useDestinations = useDestinationsHook;

// Re-export type with the correct 'export type' syntax
export type { Destination } from "./destinations/types";
