
import { devLogger } from '@/utils/logger';
import { executePredefinedDataset, executeCustomQuery, fetchTemplateDetails } from './previewApiService';
import { generateDataSample } from './previewDataProcessing';

/**
 * Actions for generating dataset previews
 */
export const previewActions = {
  /**
   * Generate a preview based on dataset type
   */
  generatePreviewByType: async (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    if (datasetType === 'predefined') {
      return await previewActions.generatePredefinedPreview(selectedTemplate, sourceId);
    } 
    else if (datasetType === 'dependent') {
      return await previewActions.generateDependentPreview(selectedDependentTemplate, sourceId);
    } 
    else if (datasetType === 'custom') {
      return await previewActions.generateCustomPreview(sourceId, customQuery);
    }
    
    throw new Error(`Unknown dataset type: ${datasetType}`);
  },

  /**
   * Generate a preview for a predefined dataset
   */
  generatePredefinedPreview: async (selectedTemplate: string, sourceId: string) => {
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
  },

  /**
   * Generate a preview for a dependent dataset
   */
  generateDependentPreview: async (selectedDependentTemplate?: string, sourceId?: string) => {
    devLogger.info('Dataset Preview', 'Dependent dataset preview requested', { 
      sourceId, 
      dependentTemplateId: selectedDependentTemplate 
    });
    
    return {
      data: [],
      sample: null,
      error: 'Dependent dataset preview is not yet implemented'
    };
  },

  /**
   * Generate a preview for a custom query
   */
  generateCustomPreview: async (sourceId: string, customQuery?: string) => {
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
