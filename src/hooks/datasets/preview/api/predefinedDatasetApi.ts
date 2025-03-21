
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';
import { logApiRequest, logApiResponse, withTimeout, handleApiResponse } from './apiBase';

/**
 * Execute a predefined dataset template
 */
export const executePredefinedDataset = async (templateKey: string, sourceId: string) => {
  try {
    devLogger.info('Dataset Preview API', 'Executing predefined dataset', { 
      templateKey, 
      sourceId 
    });
    
    // Log the request parameters for debugging
    logApiRequest('Shopify-extract edge function', {
      source_id: sourceId,
      template_key: templateKey,
      preview_only: true,
      limit: 10
    });
    
    // Create the request promise with the edge function call
    const requestPromise = supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        template_key: templateKey,
        preview_only: true,
        limit: 10, // Set limit to 10 for preview
        include_all_credentials: true // Signal to include all possible credentials
      }
    });
    
    // Execute with timeout - increase timeout to 60 seconds
    const response = await withTimeout(requestPromise, 60000);
    
    // Log the response
    logApiResponse('Shopify-extract edge function', response);
    
    return handleApiResponse(response, 'Predefined dataset');
  } catch (error: any) {
    devLogger.error('Dataset Preview API', 'Error executing predefined dataset', error);
    return { error };
  }
};
