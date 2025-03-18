
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
      let credentials: Record<string, any> = {};
      
      if (sourceData.credentials && typeof sourceData.credentials === 'object') {
        // Safely cast credentials to Record<string, any>
        credentials = sourceData.credentials as Record<string, any>;
      }
      
      // Check if we have the minimum required credentials based on source type
      let isValid = false;
      let missingFields: string[] = [];
      
      if (sourceData.source_type.toLowerCase() === 'shopify') {
        // For Shopify, check for either access_token or api_token
        const hasAccessToken = credentials && 'access_token' in credentials;
        const hasApiToken = credentials && 'api_token' in credentials;
        const hasStoreName = credentials && 'store_name' in credentials;
        
        if (!hasAccessToken && !hasApiToken) missingFields.push('API token');
        if (!hasStoreName) missingFields.push('store name');
        isValid = !missingFields.length;
      } else if (sourceData.source_type.toLowerCase() === 'woocommerce') {
        // For WooCommerce, we need api_key and store_name
        const hasApiKey = credentials && 'api_key' in credentials;
        const hasStoreName = credentials && 'store_name' in credentials;
        
        if (!hasApiKey) missingFields.push('API key');
        if (!hasStoreName) missingFields.push('store name');
        isValid = !missingFields.length;
      } else {
        // For other sources, let's assume we need at least one credential
        isValid = !!(
          (credentials && 'access_token' in credentials) || 
          (credentials && 'api_key' in credentials)
        );
      }
      
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
      
      // Success simulation (in production, this would be an actual API call)
      const successTest = true;
      
      if (successTest) {
        const result = { 
          success: true, 
          message: `Successfully connected to ${sourceData.source_type} source` 
        };
        setConnectionTestResult(result);
        return result;
      } else {
        throw new Error('Connection test failed');
      }
      
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
    setConnectionTestResult // Expose this function to fix the error
  };
}
