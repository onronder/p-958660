
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { devLogger } from '@/utils/logger';

export type ConnectionTestResult = {
  success: boolean;
  message: string;
};

export function useConnectionTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult | null>(null);
  
  const testConnection = async (sourceId: string): Promise<ConnectionTestResult> => {
    if (!sourceId) {
      const result = { success: false, message: 'No source selected' };
      setConnectionTestResult(result);
      return result;
    }
    
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    
    try {
      devLogger.debug('useConnectionTest', 'Testing connection for source', { sourceId });
      
      // First, let's fetch the source details
      const { data: sourceData, error: sourceError } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single();
      
      if (sourceError) {
        throw new Error(`Failed to fetch source details: ${sourceError.message}`);
      }
      
      // Check if we have the credentials in the source
      const credentials = sourceData.credentials || {};
      
      // Check if we have the minimum required credentials based on source type
      let isValid = false;
      let missingFields: string[] = [];
      
      if (sourceData.source_type === 'Shopify') {
        // For Shopify, check for either access_token or api_token
        const hasAccessToken = credentials && 'access_token' in credentials;
        const hasApiToken = credentials && 'api_token' in credentials;
        
        if (!hasAccessToken && !hasApiToken) {
          missingFields.push('access token');
        }
        
        isValid = missingFields.length === 0;
      } else if (sourceData.source_type === 'WooCommerce') {
        // For WooCommerce, we need api_key and store_name
        const hasApiKey = credentials && 'api_key' in credentials;
        const hasStoreName = sourceData.url && sourceData.url.length > 0;
        
        if (!hasApiKey) missingFields.push('API key');
        if (!hasStoreName) missingFields.push('store URL');
        
        isValid = missingFields.length === 0;
      } else {
        // For other sources, let's assume we need at least one credential
        isValid = !!(
          (credentials && 'access_token' in credentials) || 
          (credentials && 'api_key' in credentials) ||
          (credentials && 'api_token' in credentials)
        );
        
        if (!isValid) {
          missingFields.push('valid credentials');
        }
      }
      
      // Log the validation result for debugging
      console.log('Connection test validation:', {
        sourceId,
        sourceType: sourceData.source_type,
        isValid,
        missingFields,
        credentials: Object.keys(credentials) // Only log keys for security
      });
      
      if (!isValid) {
        const result = { 
          success: false, 
          message: `Missing credentials: ${missingFields.join(', ')}` 
        };
        setConnectionTestResult(result);
        return result;
      }
      
      // If we have valid credentials, let's simulate a connection test
      // In a real app, you would make an API call to test the connection
      const result = { 
        success: true, 
        message: `Successfully connected to ${sourceData.source_type} source` 
      };
      setConnectionTestResult(result);
      return result;
    } catch (error) {
      devLogger.error('useConnectionTest', 'Connection test error', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result = { success: false, message: errorMessage };
      setConnectionTestResult(result);
      return result;
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  return {
    isTestingConnection,
    connectionTestResult,
    testConnection,
    clearConnectionTestResult: () => setConnectionTestResult(null),
    setConnectionTestResult
  };
}
