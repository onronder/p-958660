
import { devLogger } from '@/utils/logger';
import { executeCustomQuery } from '../previewApiService';
import { generateDataSample } from '../previewDataProcessing';

/**
 * Actions for dependent dataset previews
 */
export const dependentPreviewActions = {
  /**
   * Generate a preview for a dependent dataset
   */
  generatePreview: async (selectedDependentTemplate?: string, sourceId?: string) => {
    if (!selectedDependentTemplate || !sourceId) {
      return { data: [], sample: null, error: 'Both template and source ID are required for dependent datasets' };
    }
    
    try {
      devLogger.info('Dataset Preview', 'Generating dependent dataset preview', { 
        sourceId, 
        dependentTemplateId: selectedDependentTemplate 
      });
      
      // For now, execute as a custom query since the dedicated endpoint is not yet fully implemented
      // This will be replaced with a call to a dedicated dependent endpoint in the future
      const templateQuery = `# Dependent query for template: ${selectedDependentTemplate}\n` +
                           `# This is a placeholder query. Replace with actual dependent query.\n` +
                           `{\n  products(first: 5) {\n    edges {\n      node {\n        id\n        title\n      }\n    }\n  }\n}`;
      
      const response = await executeCustomQuery(sourceId, templateQuery);
      
      if (response.error) {
        devLogger.error('Dataset Preview', 'Dependent preview execution failed', response.error);
        throw new Error(response.error.message || 'Failed to execute dependent preview');
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
      devLogger.error('Dataset Preview', 'Error generating dependent dataset preview', error);
      return { 
        data: [], 
        sample: null, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
};
