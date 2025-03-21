
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { devLogger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

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
      
      // Log the source type for debugging
      console.log('Testing connection for source type:', sourceData.source_type);
      
      // Check if we have the credentials in the source
      const credentials = sourceData.credentials ? 
        (typeof sourceData.credentials === 'object' ? sourceData.credentials : {}) : 
        {};
      
      // If source is already marked as Active, return success immediately
      if (sourceData.status === 'Active') {
        toast({
          title: 'Connection Available',
          description: `Source "${sourceData.name}" is already active and ready to use.`,
        });
        
        const result = { 
          success: true, 
          message: `Source "${sourceData.name}" is connected and ready to use.` 
        };
        setConnectionTestResult(result);
        return result;
      }
      
      // If source is marked as Failed, show warning but still attempt to test
      if (sourceData.status === 'Failed') {
        toast({
          title: 'Connection Warning',
          description: `Source "${sourceData.name}" previously had connection issues. Testing again...`,
          variant: 'default',
        });
      }
      
      // Based on source type, test the connection using specific Edge Function
      if (sourceData.source_type === 'Shopify') {
        try {
          // For Shopify, use the shopify-schema Edge Function with test_only flag
          // This ensures we use the same function for both testing and schema fetching
          const { data, error } = await supabase.functions.invoke("shopify-schema", {
            body: {
              source_id: sourceId,
              test_only: true // This flag tells the function to only test connection
            }
          });
          
          if (error || (data && data.error)) {
            const errorMsg = error?.message || data?.error || 'Connection test failed';
            throw new Error(errorMsg);
          }
          
          // Create success result
          const result = { 
            success: true, 
            message: `Successfully connected to ${sourceData.name} (${sourceData.source_type}).` 
          };
          
          toast({
            title: 'Connection Successful',
            description: `Successfully connected to ${sourceData.name}.`,
          });
          
          setConnectionTestResult(result);
          return result;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          
          const result = { 
            success: false, 
            message: `Connection failed: ${errorMsg}` 
          };
          
          toast({
            title: 'Connection Failed',
            description: errorMsg,
            variant: 'destructive',
          });
          
          setConnectionTestResult(result);
          return result;
        }
      } else {
        // For other source types (leave existing code)
        // We'll check if we have minimum required credentials
        const hasCredentials = credentials && 
          typeof credentials === 'object' && 
          Object.keys(credentials).length > 0;
          
        if (!hasCredentials) {
          const result = { 
            success: false, 
            message: `Missing credentials for ${sourceData.source_type} source.` 
          };
          setConnectionTestResult(result);
          return result;
        }
        
        // For now, just validate that we have credentials
        const result = { 
          success: true, 
          message: `${sourceData.source_type} source credentials are available.` 
        };
        setConnectionTestResult(result);
        return result;
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
  
  const clearConnectionTestResult = () => setConnectionTestResult(null);
  
  return {
    isTestingConnection,
    connectionTestResult,
    testConnection,
    clearConnectionTestResult,
    setConnectionTestResult
  };
}
