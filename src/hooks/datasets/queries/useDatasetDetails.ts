
import { useQuery } from '@tanstack/react-query';
import { fetchDatasetById } from '@/services/datasets';

/**
 * Custom hook for fetching details of a specific dataset
 */
export const useDatasetDetails = (datasetId: string | undefined) => {
  return useQuery({
    queryKey: ['datasets', 'details', datasetId],
    queryFn: () => datasetId ? fetchDatasetById(datasetId) : Promise.reject('No dataset ID provided'),
    enabled: !!datasetId,
  });
};
