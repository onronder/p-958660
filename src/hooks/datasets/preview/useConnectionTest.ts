
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
          // Different ways to extract credential ID based on shape of credentials object
          if (typeof credentials === 'object' && credentials !== null) {
            if ('credential_id' in credentials) {
              credentialId = credentials.credential_id;
              devLogger.info('Dataset Preview', 'Found credential_id in credentials object', { 
                hasCredentialId: true 
              });
            } else if (Array.isArray(credentials) && credentials.length > 0) {
              // If it's an array, try to find credential_id in the first item
              const firstItem = credentials[0];
              if (typeof firstItem === 'object' && firstItem !== null && 'credential_id' in firstItem) {
                credentialId = firstItem.credential_id;
                devLogger.info('Dataset Preview', 'Found credential_id in first array item', { 
                  hasCredentialId: true 
                });
              }
            } else {
              // Log all available keys in credentials object to help debug
              devLogger.info('Dataset Preview', 'Credentials object keys', { 
                keys: Object.keys(credentials) 
              });
            }
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
    connectionTestResult,
    setConnectionTestResult,
    testConnection
  };
};
