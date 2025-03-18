
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
            throw new Error('Failed to fetch template details');
          }
          
          // Ensure template_key exists
          if (!templateDetails.template_key) {
            throw new Error('Template key not found in template details');
          }
          
          const templateKey = templateDetails.template_key;
          
          // Execute the predefined dataset
          const { data, error } = await executePredefinedDataset(templateKey, sourceId);
          
          if (error) {
            throw new Error(error.message || 'Failed to generate preview');
          }
          
          // Process the data for preview
          const processedData = processPreviewData(data);
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
          const { data, error } = await executeCustomQuery(sourceId, customQuery);
          
          if (error) {
            devLogger.error('Dataset Preview', 'Custom query execution failed', error);
            throw new Error(error.message || 'Failed to execute custom query');
          }
          
          const processedData = Array.isArray(data.results) ? data.results : [];
          
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
      console.error('Error generating preview:', error);
      setPreviewError(error.message || 'Failed to generate preview');
      
      devLogger.error('Dataset Preview', 'Preview generation failed', error);
      
      toast({
        title: 'Preview Generation Failed',
        description: error.message || 'There was an error generating the preview.',
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
