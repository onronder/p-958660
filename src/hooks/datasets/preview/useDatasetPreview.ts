
import { devLogger } from '@/utils/logger';
import { useConnectionTest } from './useConnectionTest';
import { previewActions } from './previewActions';
import { handlePreviewError } from './previewErrorHandling';
import { usePreviewState } from './previewState';
import { PreviewGenerationOptions } from './types';

/**
 * Hook for handling dataset preview functionality
 */
export const useDatasetPreview = () => {
  // Use the preview state management hook
  const previewState = usePreviewState();
  
  // Use the connection test hook
  const { 
    testConnection,
    isTestingConnection,
    clearConnectionTestResult
  } = useConnectionTest();

  /**
   * Generate a preview based on dataset options
   */
  const generatePreview = async (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    previewState.setIsPreviewLoading(true);
    previewState.resetPreviewState();
    
    const options: PreviewGenerationOptions = {
      datasetType,
      sourceId,
      selectedTemplate,
      selectedDependentTemplate,
      customQuery
    };
    
    devLogger.info('Dataset Preview', 'Generating preview', {
      datasetType,
      sourceId,
      selectedTemplate,
      selectedDependentTemplate,
      hasCustomQuery: !!customQuery
    });
    
    try {
      // Test the connection first
      await testAndValidateConnection(sourceId);
      
      // Generate the preview
      const result = await generatePreviewData(options);
      
      // Update state with the result
      previewState.setPreviewData(result.data || []);
      previewState.setPreviewSample(result.sample || null);
      
      devLogger.info('Dataset Preview', 'Preview generated successfully', { 
        recordCount: result.data?.length || 0
      });
    } catch (error) {
      handlePreviewError(
        error, 
        previewState.retryCount, 
        previewState.setPreviewError,
        previewState.setRetryCount
      );
    } finally {
      previewState.setIsPreviewLoading(false);
    }
  };

  /**
   * Test and validate connection to the source
   */
  const testAndValidateConnection = async (sourceId: string) => {
    devLogger.info('Dataset Preview', 'Testing connection to source', { sourceId });
    const testResult = await testConnection(sourceId);
    
    // Store the connection test result
    previewState.setConnectionTestResult(testResult);
    
    if (!testResult.success) {
      throw new Error('Connection to the data source failed. Please check your credentials and try again.');
    }
    
    return testResult;
  };

  /**
   * Generate preview data based on options
   */
  const generatePreviewData = async (options: PreviewGenerationOptions) => {
    try {
      // Call the appropriate preview actions based on dataset type
      const result = await previewActions.generatePreviewByType(
        options.datasetType, 
        options.sourceId, 
        options.selectedTemplate, 
        options.selectedDependentTemplate, 
        options.customQuery
      );
        
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Function to retry the preview generation
   */
  const retryPreviewGeneration = (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    // Reset retry count on manual retry
    previewState.resetRetryCount();
    return generatePreview(datasetType, sourceId, selectedTemplate, selectedDependentTemplate, customQuery);
  };

  return {
    isPreviewLoading: previewState.isPreviewLoading,
    previewData: previewState.previewData,
    previewError: previewState.previewError,
    connectionTestResult: previewState.connectionTestResult,
    previewSample: previewState.previewSample,
    generatePreview,
    retryPreviewGeneration,
    testConnection,
    isTestingConnection,
    clearConnectionTestResult,
    retryCount: previewState.retryCount
  };
};
