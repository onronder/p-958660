
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getProductionCorsHeaders } from "../_shared/cors.ts";
import { validateUser, createSupabaseClient } from "../oauth-callback/helpers.ts";
import { handlePreviewRequest } from "./preview-handler.ts";
import { handleExtraction } from "./extraction-handler.ts";
import { createErrorResponse } from "./response-utils.ts";

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
      source_id,
      custom_query,
      preview_only = false, 
      limit = preview_only ? 5 : 250
    } = await req.json();
    
    // Handle preview requests (direct query execution)
    if (extraction_id === "preview" || (preview_only && custom_query && source_id)) {
      if (!custom_query || !source_id) {
        return createErrorResponse(
          "Missing required fields for preview: custom_query and source_id", 
          400, 
          requestOrigin
        );
      }
      
      return handlePreviewRequest({
        user,
        supabase,
        source_id,
        custom_query,
        limit,
        responseCorsHeaders
      });
    }
    
    // Validate required parameters for normal extraction
    if (!extraction_id) {
      return createErrorResponse("Missing required field: extraction_id", 400, requestOrigin);
    }
    
    // Handle the main extraction process
    return handleExtraction({
      user,
      supabase,
      extraction_id,
      preview_only,
      limit,
      responseCorsHeaders
    });
    
  } catch (error) {
    console.error("Extraction error:", error);
    
    return createErrorResponse(
      error.message || "An unknown error occurred", 
      500, 
      requestOrigin
    );
  }
});
