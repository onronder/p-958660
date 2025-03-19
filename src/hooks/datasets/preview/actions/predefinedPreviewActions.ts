
import { devLogger } from '@/utils/logger';
import { fetchTemplateDetails, executePredefinedDataset } from '../previewApiService';
import { generateDataSample } from '../previewDataProcessing';

/**
 * Actions for predefined dataset previews
 */
export const predefinedPreviewActions = {
  /**
   * Generate a preview for a predefined dataset
   */
  generatePreview: async (selectedTemplate: string, sourceId: string) => {
    try {
      // Fetch the template details to get the template_key
      devLogger.info('Dataset Preview', 'Fetching template details', { templateId: selectedTemplate });
      const { data: templateDetails, error: templateError } = await fetchTemplateDetails(selectedTemplate);
      
      if (templateError || !templateDetails) {
        throw new Error('Failed to fetch template details: ' + (templateError?.message || 'Unknown error'));
      }
      
      // Ensure template_key exists
      if (!templateDetails.template_key) {
        throw new Error('Template key not found in template details');
      }
      
      const templateKey = templateDetails.template_key;
      
      // Execute the predefined dataset
      devLogger.info('Dataset Preview', 'Executing predefined dataset', { 
        templateKey, 
        sourceId 
      });
      
      const response = await executePredefinedDataset(templateKey, sourceId);
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate preview');
      }
      
      // Type guard to check if response has data property
      if (!('data' in response) || !response.data || !response.data.results) {
        throw new Error('Invalid response format from the Edge Function');
      }
      
      // Process the data for preview
      const processedData = Array.isArray(response.data.results) ? response.data.results : [];
      
      // Generate sample preview
      const sample = generateDataSample(processedData);
      
      return {
        data: processedData,
        sample,
        error: null
      };
    } catch (error) {
      devLogger.error('Dataset Preview', 'Error generating predefined preview', error);
      return { data: [], sample: null, error: error instanceof Error ? error.message : String(error) };
    }
  }
};
