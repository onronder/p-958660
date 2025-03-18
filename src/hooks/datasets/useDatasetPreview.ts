
import { useState } from 'react';
import { executePreDefinedDataset } from '@/services/predefinedDatasets';
import { toast } from '@/hooks/use-toast';
import { devLogger } from '@/utils/DevLogger';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDatasetPreview = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [previewSample, setPreviewSample] = useState<string | null>(null);
  const { user } = useAuth();

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
      setConnectionTestResult(testResult);
      
      if (!testResult.success) {
        setIsPreviewLoading(false);
        setPreviewError('Connection to the data source failed. Please check your credentials and try again.');
        devLogger.error('Dataset Preview', 'Connection test failed', null, { sourceId, testResult });
        return;
      }

      // Handle different dataset types
      if (datasetType === 'predefined') {
        // Fetch the template details to get the template_key
        devLogger.info('Dataset Preview', 'Fetching template details', { templateId: selectedTemplate });
        
        try {
          const { data: templateDetails, error: templateError } = await supabase
            .from("pre_datasettemplate")
            .select("*")
            .eq("id", selectedTemplate)
            .single();
          
          if (templateError || !templateDetails) {
            throw new Error('Failed to fetch template details');
          }
          
          // Ensure template_key exists
          if (!templateDetails.template_key) {
            throw new Error('Template key not found in template details');
          }
          
          const templateKey = templateDetails.template_key;
          
          devLogger.info('Dataset Preview', 'Executing predefined dataset with template key', { 
            templateKey, 
            sourceId 
          });
          
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
        // Logic for custom dataset preview
        if (!customQuery) {
          throw new Error('Custom query is required');
        }
        
        devLogger.info('Dataset Preview', 'Executing custom query', { 
          sourceId,
          queryLength: customQuery.length
        });
        
        try {
          // Execute custom query
          const { data, error } = await supabase.functions.invoke("shopify-extract", {
            body: {
              source_id: sourceId,
              custom_query: customQuery,
              preview_only: true,
              limit: 10
            }
          });
          
          if (error) {
            devLogger.error('Dataset Preview', 'Custom query execution failed', error);
            throw new Error(error.message || 'Failed to execute custom query');
          }
          
          const processedData = Array.isArray(data.results) ? data.results : [];
          
          setPreviewData(processedData);
          
          // Generate sample preview
          generateDataSample(processedData);
          
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
      
      devLogger.info('Dataset Preview', 'Generated data sample', { 
        sampleSize: sampleItems.length 
      });
    } catch (error) {
      console.error('Error generating data sample:', error);
      devLogger.error('Dataset Preview', 'Error generating data sample', error);
      setPreviewSample(null);
    }
  };

  const testConnection = async (sourceId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      devLogger.info('Dataset Preview', 'Testing connection to source', { sourceId });
      
      // First get source details to determine the source type
      const { data: sourceData, error: sourceError } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single();
      
      if (sourceError || !sourceData) {
        devLogger.error('Dataset Preview', 'Source not found', sourceError, { sourceId });
        return {
          success: false,
          message: 'Source not found. Please select a valid source.'
        };
      }
      
      // For Shopify sources, use the shopify-private edge function
      if (sourceData.source_type === 'Shopify') {
        // Extract the credential ID from the source
        // Handle credentials as a JSON object
        let credentials: any = null;
        
        // Log the raw credentials data for debugging
        devLogger.info('Dataset Preview', 'Raw source credentials data', { 
          credentialsType: typeof sourceData.credentials,
          hasCredentials: !!sourceData.credentials
        });
        
        if (typeof sourceData.credentials === 'string') {
          try {
            // Attempt to parse if it's a JSON string
            credentials = JSON.parse(sourceData.credentials);
          } catch (e) {
            devLogger.error('Dataset Preview', 'Failed to parse credentials string', e);
            credentials = null;
          }
        } else if (sourceData.credentials && typeof sourceData.credentials === 'object') {
          credentials = sourceData.credentials;
        }
        
        // Find credential_id field
        let credentialId: string | null = null;
        
        if (credentials) {
          // Directly check for credential_id in the object
          if ('credential_id' in credentials) {
            credentialId = credentials.credential_id;
            devLogger.info('Dataset Preview', 'Found credential_id in credentials object', { 
              hasCredentialId: true 
            });
          } else {
            // Log all available keys in credentials object to help debug
            devLogger.info('Dataset Preview', 'Credentials object keys', { 
              keys: Object.keys(credentials) 
            });
          }
        }
        
        if (!credentialId) {
          devLogger.error('Dataset Preview', 'Source has no credential ID', null, { 
            sourceId,
            source: sourceData.name,
            sourceType: sourceData.source_type
          });
          return {
            success: false,
            message: 'Source has no credentials attached.'
          };
        }
        
        // Get the Shopify credentials
        const { data: credentialData, error: credentialError } = await supabase
          .from('shopify_credentials')
          .select('*')
          .eq('id', credentialId)
          .single();
          
        if (credentialError || !credentialData) {
          devLogger.error('Dataset Preview', 'Failed to fetch credentials', credentialError, { credentialId });
          return {
            success: false,
            message: 'Failed to fetch credentials for this source.'
          };
        }
        
        // Test connection using shopify-private edge function
        devLogger.info('Dataset Preview', 'Testing Shopify connection', { 
          storeUrl: credentialData.store_name,
          userId: user?.id 
        });
        
        const { data, error } = await supabase.functions.invoke('shopify-private', {
          body: {
            action: 'test_connection',
            store_url: credentialData.store_name,
            api_key: credentialData.api_key,
            api_token: credentialData.api_token,
            user_id: user?.id
          }
        });
        
        if (error || data?.error) {
          const errorMessage = error?.message || data?.error || 'Connection test failed';
          devLogger.error('Dataset Preview', 'Shopify connection test failed', error || data?.error, { 
            sourceId,
            errorType: data?.errorType
          });
          
          return {
            success: false,
            message: errorMessage
          };
        }
        
        devLogger.info('Dataset Preview', 'Shopify connection test succeeded');
        
        return {
          success: true,
          message: 'Successfully connected to Shopify store.'
        };
      }
      
      // For other source types, implement similar connection tests
      // Currently returning success by default for other sources as a fallback
      devLogger.warn('Dataset Preview', 'Connection test not implemented for source type', { 
        sourceType: sourceData.source_type 
      });
      
      return {
        success: true,
        message: `Connection test not fully implemented for ${sourceData.source_type} sources.`
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      devLogger.error('Dataset Preview', 'Unexpected error testing connection', error);
      
      return {
        success: false,
        message: error.message || 'Error testing connection'
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
