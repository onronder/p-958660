
import { useState } from "react";

/**
 * Hook for managing the destination status filter
 */
export const useDestinationsStatus = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  return {
    selectedStatus,
    setSelectedStatus
  };
};
