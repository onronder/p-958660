
import { useState } from 'react';
import { executePreDefinedDataset } from '@/services/predefinedDatasets';
import { toast } from '@/hooks/use-toast';

export const useDatasetPreview = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [previewSample, setPreviewSample] = useState<string | null>(null);

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
        
        // Process the data for preview
        const processedData = processPreviewData(data);
        setPreviewData(processedData);
        
        // Generate sample preview
        generateDataSample(processedData);
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
        
        // Generate sample preview
        generateDataSample(data);
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

  // Process preview data to standardize format
  const processPreviewData = (data: any): any[] => {
    // For Shopify orders data
    if (data && data.orders) {
      return data.orders;
    }
    
    // Handle other data types
    if (Array.isArray(data)) {
      return data;
    }
    
    // Try to extract data from known paths
    if (data && typeof data === 'object') {
      // Check common data paths
      for (const key of ['data', 'results', 'items', 'records']) {
        if (data[key] && Array.isArray(data[key])) {
          return data[key];
        }
      }
      
      // If we can't find a specific array, return the object in an array
      return [data];
    }
    
    return [];
  };

  // Generate a small sample of data for quick preview
  const generateDataSample = (data: any[]) => {
    try {
      if (!data || data.length === 0) {
        setPreviewSample(null);
        return;
      }
      
      // Take first 3 items, or fewer if not available
      const sampleItems = data.slice(0, 3);
      
      // Format the sample data nicely
      const formatted = JSON.stringify(sampleItems, null, 2);
      setPreviewSample(formatted);
      
    } catch (error) {
      console.error('Error generating data sample:', error);
      setPreviewSample(null);
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
    previewSample,
    generatePreview,
  };
};
