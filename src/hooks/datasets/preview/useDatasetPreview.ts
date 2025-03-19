
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { devLogger } from '@/utils/logger';
import { useConnectionTest } from './useConnectionTest';
import { previewActions } from './previewActions';
import { PreviewError } from './types';

/**
 * Hook for handling dataset preview functionality
 */
export const useDatasetPreview = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSample, setPreviewSample] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the connection test hook
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

      try {
        // Call the appropriate preview actions based on dataset type
        const result = await previewActions.generatePreviewByType(
          datasetType, 
          sourceId, 
          selectedTemplate, 
          selectedDependentTemplate, 
          customQuery
        );
          
        if (result.error) {
          throw new Error(result.error);
        }
        
        setPreviewData(result.data || []);
        setPreviewSample(result.sample || null);
        
        devLogger.info('Dataset Preview', 'Preview generated successfully', { 
          recordCount: result.data?.length || 0
        });
      } catch (error) {
        throw error;
      }
    } catch (error) {
      const errorHandler = new PreviewError(error);
      const { errorMessage, shouldIncrementRetry } = errorHandler.getFormattedError(retryCount);
      
      console.error('Error generating preview:', error);
      setPreviewError(errorMessage);
      
      devLogger.error('Dataset Preview', 'Preview generation failed', error);
      
      toast({
        title: 'Preview Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (shouldIncrementRetry) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Function to retry the preview generation
  const retryPreviewGeneration = (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    // Reset retry count on manual retry
    setRetryCount(0);
    return generatePreview(datasetType, sourceId, selectedTemplate, selectedDependentTemplate, customQuery);
  };

  return {
    isPreviewLoading,
    previewData,
    previewError,
    connectionTestResult,
    previewSample,
    generatePreview,
    retryPreviewGeneration,
    testConnection,
    isTestingConnection,
    clearConnectionTestResult,
    retryCount
  };
};
