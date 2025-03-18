
import { supabase } from "@/integrations/supabase/client";

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
