
import { useQuery } from '@tanstack/react-query';
import { fetchPredefinedTemplates } from '@/services/predefinedDatasets';
import { devLogger } from '@/utils/DevLogger';

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
    queryFn: async () => {
      devLogger.info('PredefinedDatasets', `Fetching predefined templates for source type: ${sourceType}`);
      try {
        const templates = await fetchPredefinedTemplates(sourceType);
        devLogger.info('PredefinedDatasets', `Fetched ${templates.length} templates successfully`);
        return templates;
      } catch (error) {
        devLogger.error('PredefinedDatasets', 'Failed to fetch templates', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
