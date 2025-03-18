
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { devLogger } from '@/utils/logger';
import { useConnectionTest } from './preview/useConnectionTest';
import { processPreviewData, generateDataSample } from './preview/previewDataProcessing';
import { executePredefinedDataset, executeCustomQuery, fetchTemplateDetails } from './preview/previewApiService';

export const useDatasetPreview = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSample, setPreviewSample] = useState<string | null>(null);
  
  // Use the connection test hook with full return type
  const { 
    connectionTestResult, 
    setConnectionTestResult, 
    testConnection,
    isTestingConnection,
    clearConnectionTestResult
  } = useConnectionTest();

  const generatePreview = async (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewData([]);
    setPreviewSample(null);
    
    devLogger.info('Dataset Preview', 'Generating preview', {
      datasetType,
      sourceId,
      selectedTemplate,
      selectedDependentTemplate,
      hasCustomQuery: !!customQuery
    });
    
    try {
      // Test the connection first
      devLogger.info('Dataset Preview', 'Testing connection to source', { sourceId });
      const testResult = await testConnection(sourceId);
      
      // Store the connection test result
      if (setConnectionTestResult) {
        setConnectionTestResult(testResult);
      }
      
      if (!testResult.success) {
        setIsPreviewLoading(false);
        setPreviewError('Connection to the data source failed. Please check your credentials and try again.');
        devLogger.error('Dataset Preview', 'Connection test failed', null, { sourceId, testResult });
        return;
      }

      // Handle different dataset types
      if (datasetType === 'predefined') {
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
          setPreviewData(processedData);
          
          // Generate sample preview
          const sample = generateDataSample(processedData);
          setPreviewSample(sample);
          
          devLogger.info('Dataset Preview', 'Preview generated successfully', { 
            recordCount: processedData.length 
          });
        } catch (error) {
          devLogger.error('Dataset Preview', 'Error fetching template or executing query', error);
          throw error;
        }
      } 
      else if (datasetType === 'dependent') {
        // Logic for dependent dataset preview
        devLogger.info('Dataset Preview', 'Dependent dataset preview requested', { 
          sourceId, 
          dependentTemplateId: selectedDependentTemplate 
        });
        
        setPreviewError('Dependent dataset preview is not yet implemented');
        devLogger.warn('Dataset Preview', 'Dependent dataset preview not implemented');
      } 
      else if (datasetType === 'custom') {
        if (!customQuery) {
          throw new Error('Custom query is required');
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
          
          setPreviewData(processedData);
          
          // Generate sample preview
          const sample = generateDataSample(processedData);
          setPreviewSample(sample);
          
          devLogger.info('Dataset Preview', 'Custom query preview generated successfully', { 
            recordCount: processedData.length 
          });
        } catch (error) {
          devLogger.error('Dataset Preview', 'Error executing custom query', error);
          throw error;
        }
      }
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      
      // Check if the error relates to Edge Function
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('network') || 
          errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Failed to send a request to the Edge Function. Please check network connectivity and edge function logs.';
      }
      
      console.error('Error generating preview:', error);
      setPreviewError(errorMessage);
      
      devLogger.error('Dataset Preview', 'Preview generation failed', error);
      
      toast({
        title: 'Preview Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return {
    isPreviewLoading,
    previewData,
    previewError,
    connectionTestResult,
    previewSample,
    generatePreview,
    testConnection,
    isTestingConnection,
    clearConnectionTestResult
  };
};
