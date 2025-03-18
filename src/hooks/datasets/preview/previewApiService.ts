
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/DevLogger';

/**
 * Execute a predefined dataset template
 */
export const executePredefinedDataset = async (templateKey: string, sourceId: string) => {
  try {
    devLogger.info('Dataset Preview API', 'Executing predefined dataset', { 
      templateKey, 
      sourceId 
    });
    
    const response = await supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        template_key: templateKey,
        preview_only: true,
        limit: 10
      }
    });
    
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
    
    const response = await supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        custom_query: customQuery,
        preview_only: true,
        limit: 10
      }
    });
    
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
