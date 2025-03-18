
import { useState } from 'react';
import { executePreDefinedDataset } from '@/services/predefinedDatasets';
import { toast } from '@/hooks/use-toast';

export const useDatasetPreview = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const generatePreview = async (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    
    try {
      // Test the connection first
      const testResult = await testConnection(sourceId);
      setConnectionTestResult(testResult);
      
      if (!testResult.success) {
        setIsPreviewLoading(false);
        setPreviewError('Connection to the data source failed. Please check your credentials and try again.');
        return;
      }

      // Handle different dataset types
      if (datasetType === 'predefined') {
        // Fetch the template details to get the template_key
        const templateDetailsResponse = await fetch(`/api/datasets/template/${selectedTemplate}`);
        if (!templateDetailsResponse.ok) {
          throw new Error('Failed to fetch template details');
        }
        
        const templateDetails = await templateDetailsResponse.json();
        const templateKey = templateDetails.template_key;
        
        // Execute the predefined dataset
        const { data, error } = await executePreDefinedDataset(templateKey, sourceId);
        
        if (error) {
          throw new Error(error.message || 'Failed to generate preview');
        }
        
        setPreviewData(data);
      } 
      else if (datasetType === 'dependent') {
        // Logic for dependent dataset preview
        // This will be implemented in a future step
        setPreviewError('Dependent dataset preview is not yet implemented');
      } 
      else if (datasetType === 'custom') {
        // Logic for custom dataset preview
        if (!customQuery) {
          throw new Error('Custom query is required');
        }
        
        // Execute custom query
        const response = await fetch('/api/datasets/custom-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId,
            query: customQuery,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate preview');
        }
        
        const data = await response.json();
        setPreviewData(data);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewError(error.message || 'Failed to generate preview');
      toast({
        title: 'Preview Generation Failed',
        description: error.message || 'There was an error generating the preview.',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const testConnection = async (sourceId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await fetch(`/api/sources/test-connection/${sourceId}`);
      
      if (!response.ok) {
        return {
          success: false,
          message: 'Connection failed. Please check your credentials.'
        };
      }
      
      const data = await response.json();
      return {
        success: data.success === true,
        message: data.success ? 'Connection successful' : 'Connection failed'
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        message: 'Error testing connection'
      };
    }
  };

  return {
    isPreviewLoading,
    previewData,
    previewError,
    connectionTestResult,
    generatePreview,
  };
};
