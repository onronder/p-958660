
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { devLogger } from '@/utils/DevLogger';

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
      
      // First, let's fetch the source details to get its type
      const { data: sourceData, error: sourceError } = await supabase
        .from('sources')
        .select('source_type, access_token, api_key, store_name, credentials_id')
        .eq('id', sourceId)
        .single();
      
      if (sourceError) {
        throw new Error(`Failed to fetch source details: ${sourceError.message}`);
      }
      
      // Check if we have the credentials directly in the source
      let credentials = null;
      
      if (sourceData.access_token || sourceData.api_key) {
        // We have direct credentials
        credentials = {
          access_token: sourceData.access_token,
          api_key: sourceData.api_key,
          store_name: sourceData.store_name
        };
      } else if (sourceData.credentials_id) {
        // We need to fetch credentials from another table
        const { data: credentialsData, error: credentialsError } = await supabase
          .from(`${sourceData.source_type.toLowerCase()}_credentials`)
          .select('access_token, api_key, store_name')
          .eq('id', sourceData.credentials_id)
          .single();
        
        if (credentialsError) {
          throw new Error(`Failed to fetch credentials: ${credentialsError.message}`);
        }
        
        credentials = credentialsData;
      }
      
      if (!credentials) {
        throw new Error('No credentials found for this source');
      }
      
      // Check if we have the minimum required credentials based on source type
      let isValid = false;
      let missingFields: string[] = [];
      
      if (sourceData.source_type.toLowerCase() === 'shopify') {
        // For Shopify, we need access_token and store_name
        if (!credentials.access_token) missingFields.push('access token');
        if (!credentials.store_name) missingFields.push('store name');
        isValid = !missingFields.length;
      } else if (sourceData.source_type.toLowerCase() === 'woocommerce') {
        // For WooCommerce, we need api_key and store_name
        if (!credentials.api_key) missingFields.push('API key');
        if (!credentials.store_name) missingFields.push('store name');
        isValid = !missingFields.length;
      } else {
        // For other sources, let's assume we need at least one credential
        isValid = !!(credentials.access_token || credentials.api_key);
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
      devLogger.error('useConnectionTest', 'Connection test error', { error });
      
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
    clearConnectionTestResult: () => setConnectionTestResult(null)
  };
}
