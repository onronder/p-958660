
import { useDestinationsHook } from "./destinations/useDestinationsHook";
export { Destination } from "./destinations/types";

// Re-export the hook for backward compatibility
export const useDestinations = useDestinationsHook;
