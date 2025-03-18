
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { devLogger } from '@/utils/DevLogger';
import { useAuth } from '@/contexts/AuthContext';

export const useConnectionTest = () => {
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const { user } = useAuth();

  const testConnection = async (sourceId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      devLogger.info('Dataset Preview', 'Testing connection to source', { sourceId });
      
      if (!sourceId) {
        return {
          success: false,
          message: 'No source selected. Please select a valid source.'
        };
      }
      
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
        // Extract the credential details from the source
        let credentialId: string | null = null;
        let shopifyCredentialData: any = null;
        
        // Log the raw credentials data for debugging
        devLogger.info('Dataset Preview', 'Raw source credentials data', { 
          credentialsType: typeof sourceData.credentials,
          hasCredentials: !!sourceData.credentials
        });
        
        // Try to extract credential_id from the credentials
        if (sourceData.credentials) {
          if (typeof sourceData.credentials === 'object' && sourceData.credentials !== null) {
            // If credentials is a direct object with credential_id
            if ('credential_id' in sourceData.credentials) {
              credentialId = sourceData.credentials.credential_id;
              devLogger.info('Dataset Preview', 'Found credential_id in credentials object', { 
                credentialId 
              });
            } 
            // If credentials contains api_key and api_token directly
            else if ('api_key' in sourceData.credentials && 'api_token' in sourceData.credentials && 'store_name' in sourceData.credentials) {
              // Use credentials directly without fetching from shopify_credentials
              shopifyCredentialData = {
                store_name: sourceData.credentials.store_name,
                api_key: sourceData.credentials.api_key,
                api_token: sourceData.credentials.api_token
              };
              
              devLogger.info('Dataset Preview', 'Found credentials directly in source', { 
                hasCredentials: true,
                storeUrl: sourceData.credentials.store_name 
              });
            }
          }
        }
        
        // If we have a credential ID but not the credential data yet, fetch it
        if (credentialId && !shopifyCredentialData) {
          const { data: fetchedCredentialData, error: credentialError } = await supabase
            .from('shopify_credentials')
            .select('*')
            .eq('id', credentialId)
            .single();
            
          if (credentialError || !fetchedCredentialData) {
            devLogger.error('Dataset Preview', 'Failed to fetch shopify credentials', credentialError, { credentialId });
            return {
              success: false,
              message: 'Failed to fetch credentials for this source.'
            };
          }
          
          shopifyCredentialData = fetchedCredentialData;
        }
        
        // Check if we have the necessary credential data
        if (!shopifyCredentialData) {
          devLogger.error('Dataset Preview', 'No shopify credentials found', null, { 
            sourceId,
            source: sourceData.name
          });
          return {
            success: false,
            message: 'No valid credentials found for this Shopify source.'
          };
        }
        
        // Test connection using shopify-private edge function
        devLogger.info('Dataset Preview', 'Testing Shopify connection', { 
          storeUrl: shopifyCredentialData.store_name,
          userId: user?.id 
        });
        
        const { data, error } = await supabase.functions.invoke('shopify-private', {
          body: {
            action: 'test_connection',
            store_url: shopifyCredentialData.store_name,
            api_key: shopifyCredentialData.api_key,
            api_token: shopifyCredentialData.api_token,
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
    connectionTestResult,
    setConnectionTestResult,
    testConnection
  };
};
