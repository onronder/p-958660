
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPredefinedTemplates, 
  fetchUserDatasets, 
  executePreDefinedDataset,
  deleteUserDataset,
  PredefinedDatasetTemplate,
  UserDataset
} from '@/services/predefinedDatasets';
import { toast } from '@/hooks/use-toast';

export const usePredefinedTemplates = (sourceType?: string) => {
  return useQuery({
    queryKey: ['predefinedTemplates', sourceType],
    queryFn: () => fetchPredefinedTemplates(sourceType),
  });
};

export const useUserDatasets = () => {
  return useQuery({
    queryKey: ['userDatasets'],
    queryFn: fetchUserDatasets,
  });
};

export const useExecutePredefinedDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      templateKey, 
      sourceId, 
      params 
    }: { 
      templateKey: string; 
      sourceId: string; 
      params?: Record<string, any> 
    }) => {
      return executePreDefinedDataset(templateKey, sourceId, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDatasets'] });
      toast({
        title: "Dataset created successfully",
        description: "Your dataset has been created and is ready to use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create dataset",
        description: error.message || "There was an error creating your dataset.",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteUserDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (datasetId: string) => deleteUserDataset(datasetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDatasets'] });
      toast({
        title: "Dataset deleted",
        description: "The dataset has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete dataset",
        description: "There was an error deleting the dataset.",
        variant: "destructive",
      });
    }
  });
};
