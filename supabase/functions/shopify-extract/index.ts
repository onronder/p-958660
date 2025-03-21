
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";
import { handlePreviewRequest } from "./preview-handler.ts";
import { handleExtractionRequest } from "./extraction-handler.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const origin = req.headers.get('origin');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    const body = await req.json();
    
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
      return await handlePreviewRequest(requestData, supabase, corsHeaders);
    } else {
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
