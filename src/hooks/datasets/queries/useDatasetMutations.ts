
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDataset, updateDataset, deleteDataset, restoreDataset, permanentlyDeleteDataset } from '@/services/datasets';
import { Dataset } from '@/types/dataset';

/**
 * Custom hook for dataset mutation operations
 */
export const useDatasetMutations = () => {
  const queryClient = useQueryClient();

  const createDatasetMutation = useMutation({
    mutationFn: (datasetData: Partial<Dataset>) => createDataset(datasetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  const updateDatasetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Dataset> }) => 
      updateDataset(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  const deleteDatasetMutation = useMutation({
    mutationFn: (id: string) => deleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  const restoreDatasetMutation = useMutation({
    mutationFn: (id: string) => restoreDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  const permanentlyDeleteDatasetMutation = useMutation({
    mutationFn: (id: string) => permanentlyDeleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  return {
    createDataset: createDatasetMutation,
    updateDataset: updateDatasetMutation,
    deleteDataset: deleteDatasetMutation,
    restoreDataset: restoreDatasetMutation,
    permanentlyDeleteDataset: permanentlyDeleteDatasetMutation,
  };
};
