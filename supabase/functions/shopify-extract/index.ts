
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { handleExtraction } from "./extraction-handler.ts";
import { handlePreviewRequest } from "./preview-handler.ts";
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
      source_id: requestData.source_id,
      limit: requestData.limit || 5
    }));

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the user from the JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse({
        message: "Missing Authorization header",
      }, 401, origin, 'authentication_error');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return createErrorResponse({
        message: "Invalid or expired token",
        details: userError
      }, 401, origin, 'authentication_error');
    }
    
    // Add the user to the request data
    requestData.user = user;
    
    // Determine if this is a preview or a full extraction
    if (requestData.preview_only) {
      console.log("Handling preview request");
      return await handlePreviewRequest(requestData, supabase, corsHeaders);
    } else {
      console.log("Handling extraction request");
      return await handleExtraction(requestData, supabase, corsHeaders);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Determine the error type for better client-side handling
    let errorType = 'general_error';
    let status = 500;
    
    if (error.message?.includes('timeout')) {
      errorType = 'timeout_error';
      status = 408;
    } else if (error.message?.includes('payload') || error.message?.includes('too large')) {
      errorType = 'payload_size_error';
      status = 413;
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      errorType = 'network_error';
      status = 503;
    } else if (error.message?.includes('parse')) {
      errorType = 'parse_error';
      status = 400;
    }
    
    // Return a structured error response
    return createErrorResponse({
      message: `Failed to process Shopify extraction: ${error.message}`,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - requestStartTime
    }, status, origin, errorType);
  }
});
