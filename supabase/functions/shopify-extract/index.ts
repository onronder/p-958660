
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getProductionCorsHeaders } from "../_shared/cors.ts";
import { handlePreviewRequest } from "./preview-handler.ts";
import { handleExtractionRequest } from "./extraction-handler.ts";

serve(async (req) => {
  console.log("shopify-extract function called:", req.url);
  
  // Get the request origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getProductionCorsHeaders(origin);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Processing request body");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    const body = await req.json();
    console.log("Request body parsed:", JSON.stringify(body));
    
    // Authenticate the request
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
    
    // Special case for ping requests for connectivity tests
    if (body.ping === true) {
      console.log("Handling ping request");
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Connection successful',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
    
    // Add user information to request data
    const requestData = { ...body, user };
    
    // Handle preview or full extraction
    if (requestData.preview_only === true) {
      console.log("Handling preview request");
      return await handlePreviewRequest(requestData, supabase, corsHeaders);
    } else {
      console.log("Handling extraction request");
      return await handleExtractionRequest(requestData, supabase, corsHeaders);
    }
  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
