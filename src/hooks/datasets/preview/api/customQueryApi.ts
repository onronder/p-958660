
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';
import { logApiRequest, logApiResponse, withTimeout, handleApiResponse } from './apiBase';

/**
 * Execute a custom query
 */
export const executeCustomQuery = async (sourceId: string, customQuery: string) => {
  try {
    devLogger.info('Dataset Preview API', 'Executing custom query', { 
      sourceId,
      queryLength: customQuery.length
    });
    
    // Log the request for debugging
    logApiRequest('Custom query', {
      endpoint: 'shopify-extract',
      source_id: sourceId,
      has_custom_query: !!customQuery,
      query_length: customQuery.length,
    });
    
    // Create the request promise
    const requestPromise = supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        custom_query: customQuery,
        preview_only: true,
        limit: 10
      }
    });
    
    // Execute with timeout
    const response = await withTimeout(requestPromise);
    
    // Log the response
    logApiResponse('Custom query', response);
    
    return handleApiResponse(response, 'Custom query');
  } catch (error: any) {
    devLogger.error('Dataset Preview API', 'Error executing custom query', error);
    return { error };
  }
};
