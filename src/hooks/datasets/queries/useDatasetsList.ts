
import { useQuery } from '@tanstack/react-query';
import { fetchUserDatasets, fetchDeletedDatasets } from '@/services/datasets';
import { Dataset } from '@/types/dataset';

/**
 * Custom hook for fetching active datasets
 */
export const useDatasetsList = () => {
  return useQuery({
    queryKey: ['datasets', 'active'],
    queryFn: fetchUserDatasets,
  });
};

/**
 * Custom hook for fetching deleted datasets
 */
export const useDeletedDatasetsList = () => {
  return useQuery({
    queryKey: ['datasets', 'deleted'],
    queryFn: fetchDeletedDatasets,
  });
};
