
import { useExportDestination } from "./useExportDestination";

export const useRetryExport = () => {
  const exportMutation = useExportDestination();

  // Retry failed export
  const handleRetryExport = (id: string) => {
    exportMutation.mutate(id);
  };

  return {
    handleRetryExport,
    exportMutation
  };
};
