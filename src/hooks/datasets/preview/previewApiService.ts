
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';

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
    devLogger.debug('Dataset Preview API', 'Shopify-extract edge function request', {
      source_id: sourceId,
      template_key: templateKey,
      preview_only: true,
      limit: 10
    });
    
    const response = await supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        template_key: templateKey,
        preview_only: true,
        limit: 10
      }
    });
    
    // Log the response for debugging
    devLogger.debug('Dataset Preview API', 'Edge function response', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      hasError: !!response.error
    });
    
    // If there's an error in the response, log and handle it
    if (response.error) {
      devLogger.error('Dataset Preview API', 'Edge function error', response.error);
      return { error: response.error };
    }
    
    // Check for application-level errors in the response data
    if (response.data && response.data.error) {
      devLogger.error('Dataset Preview API', 'Application error in response', response.data.error);
      return { error: new Error(response.data.error) };
    }
    
    return response;
  } catch (error) {
    devLogger.error('Dataset Preview API', 'Error executing predefined dataset', error);
    throw error;
  }
};

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
    devLogger.debug('Dataset Preview API', 'Custom query request', {
      endpoint: 'shopify-extract',
      source_id: sourceId,
      has_custom_query: !!customQuery,
      query_length: customQuery.length,
    });
    
    const response = await supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        custom_query: customQuery,
        preview_only: true,
        limit: 10
      }
    });
    
    // Log the response for debugging
    devLogger.debug('Dataset Preview API', 'Custom query response', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      hasError: !!response.error
    });
    
    // If there's an error in the response, log and handle it
    if (response.error) {
      devLogger.error('Dataset Preview API', 'Edge function error', response.error);
      return { error: response.error };
    }
    
    // Check for application-level errors in the response data
    if (response.data && response.data.error) {
      devLogger.error('Dataset Preview API', 'Application error in response', response.data.error);
      return { error: new Error(response.data.error) };
    }
    
    return response;
  } catch (error) {
    devLogger.error('Dataset Preview API', 'Error executing custom query', error);
    throw error;
  }
};

/**
 * Fetch template details
 */
export const fetchTemplateDetails = async (templateId: string) => {
  try {
    devLogger.info('Dataset Preview API', 'Fetching template details', {
      templateId
    });
    
    const response = await supabase
      .from("pre_datasettemplate")
      .select("*")
      .eq("id", templateId)
      .single();
    
    return response;
  } catch (error) {
    devLogger.error('Dataset Preview API', 'Error fetching template details', error);
    throw error;
  }
};

/**
 * Service functions for making dataset preview API requests
 */
export const fetchPreviewData = async (params: {
  sourceId: string;
  datasetType: "predefined" | "dependent" | "custom" | undefined;
  templateName: string;
  customQuery: string;
  limit?: number;
}) => {
  const { sourceId, datasetType, templateName, customQuery, limit = 5 } = params;
  
  // Build the request body based on dataset type
  let queryBody: any = {
    extraction_id: "preview",
    source_id: sourceId,
    preview_only: true,
    limit
  };
  
  if (datasetType === "custom") {
    queryBody.custom_query = customQuery;
    
    // Direct custom query
    return supabase.functions.invoke("shopify-extract", {
      body: queryBody
    });
  } 
  
  if (datasetType === "predefined") {
    // For predefined queries
    return supabase.functions.invoke("shopify-extract", {
      body: {
        ...queryBody,
        template_name: templateName,
        extraction_type: "predefined"
      }
    });
  } 
  
  if (datasetType === "dependent") {
    // For dependent queries
    return supabase.functions.invoke("shopify-dependent", {
      body: {
        ...queryBody,
        template_name: templateName
      }
    });
  }
  
  // If no valid datasetType, return an error
  throw new Error("Invalid dataset type");
};
