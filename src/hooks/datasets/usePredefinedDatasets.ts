
import { useQuery } from '@tanstack/react-query';
import { fetchPredefinedTemplates } from '@/services/predefinedDatasets';

export interface PredefinedDatasetTemplate {
  id: string;
  name: string;
  description: string;
  template_key: string;
  source_type: string;
  created_at: string;
}

export const usePredefinedTemplates = (sourceType: string = 'shopify') => {
  return useQuery({
    queryKey: ['predefinedTemplates', sourceType],
    queryFn: () => fetchPredefinedTemplates(sourceType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
