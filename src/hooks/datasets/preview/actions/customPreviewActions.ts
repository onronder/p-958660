
import { devLogger } from '@/utils/logger';
import { executeCustomQuery } from '../previewApiService';
import { generateDataSample } from '../previewDataProcessing';

/**
 * Actions for custom query previews
 */
export const customPreviewActions = {
  /**
   * Generate a preview for a custom query
   */
  generatePreview: async (sourceId: string, customQuery?: string) => {
    if (!customQuery) {
      return { data: [], sample: null, error: 'Custom query is required' };
    }
    
    try {
      // Execute custom query
      devLogger.info('Dataset Preview', 'Executing custom query', {
        sourceId,
        queryLength: customQuery.length
      });
      
      const response = await executeCustomQuery(sourceId, customQuery);
      
      if (response.error) {
        devLogger.error('Dataset Preview', 'Custom query execution failed', response.error);
        throw new Error(response.error.message || 'Failed to execute custom query');
      }
      
      // Type guard to check if response has data property
      if (!('data' in response) || !response.data || !response.data.results) {
        throw new Error('Invalid response format from the Edge Function');
      }
      
      const processedData = Array.isArray(response.data.results) ? response.data.results : [];
      
      // Generate sample preview
      const sample = generateDataSample(processedData);
      
      return {
        data: processedData,
        sample,
        error: null
      };
    } catch (error) {
      devLogger.error('Dataset Preview', 'Error executing custom query', error);
      return { data: [], sample: null, error: error instanceof Error ? error.message : String(error) };
    }
  }
};
