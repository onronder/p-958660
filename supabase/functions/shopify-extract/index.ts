
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { handleExtraction } from "./extraction-handler.ts";
import { handlePreview } from "./preview-handler.ts";
import { createErrorResponse, createSuccessResponse, handleCorsPreflightRequest } from "./response-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestStartTime = Date.now();
  
  // Get origin for CORS
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(origin);
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Special case: handle ping request for connectivity testing
    if (requestData.ping === true) {
      console.log("Ping request received - confirming connectivity");
      return createSuccessResponse({ 
        status: "ok", 
        message: "shopify-extract function is online" 
      }, origin);
    }
    
    // Log the request
    console.log("Request received:", JSON.stringify({
      preview_only: requestData.preview_only,
      has_custom_query: !!requestData.custom_query,
      has_template_name: !!requestData.template_name,
      has_template_key: !!requestData.template_key,
    }));

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Determine if this is a preview or a full extraction
    if (requestData.preview_only) {
      return await handlePreview(requestData, supabase, origin);
    } else {
      return await handleExtraction(requestData, supabase, origin);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return a structured error response
    return createErrorResponse({
      message: `Failed to process Shopify extraction: ${error.message}`,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - requestStartTime
    }, 500, origin);
  }
});
