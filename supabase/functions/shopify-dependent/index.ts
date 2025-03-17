
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, getProductionCorsHeaders } from "../_shared/cors.ts";
import { validateUser, createSupabaseClient } from "../oauth-callback/helpers.ts";
import { handlePreviewRequest } from "./preview-handler.ts";
import { handleExtractionRequest } from "./extraction-handler.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  const requestOrigin = req.headers.get("origin");
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    
    // Get user from authorization header
    const authHeader = req.headers.get("authorization");
    const user = await validateUser(supabase, authHeader?.replace("Bearer ", ""));
    
    // Parse request body
    const { 
      extraction_id,
      preview_only = false
    } = await req.json();
    
    if (!extraction_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: extraction_id" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Handle preview or full extraction based on preview_only flag
    if (preview_only) {
      return handlePreviewRequest({
        user,
        supabase,
        extraction_id,
        responseCorsHeaders
      });
    } else {
      return handleExtractionRequest({
        user,
        supabase,
        extraction_id,
        responseCorsHeaders
      });
    }
  } catch (error) {
    console.error("Dependent extraction error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
});
