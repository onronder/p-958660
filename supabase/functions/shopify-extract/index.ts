
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
    console.log("Shopify Extract function called", { 
      method: req.method,
      headers: Object.fromEntries([...req.headers]),
      origin: requestOrigin
    });
    
    // Handle ping request for connectivity testing
    try {
      const requestData = await req.json();
      if (requestData && requestData.ping === true) {
        console.log("Ping request received, returning success response");
        return new Response(
          JSON.stringify({ status: "ok", message: "Edge Function is online" }),
          { 
            status: 200, 
            headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
          }
        );
      }
    } catch (e) {
      // Not a ping request or couldn't parse JSON, continue with normal processing
    }
    
    const supabase = createSupabaseClient();
    
    // Get user from authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return createErrorResponse("Unauthorized: Missing authorization header", 401, requestOrigin);
    }
    
    try {
      const user = await validateUser(supabase, authHeader.replace("Bearer ", ""));
      if (!user) {
        console.error("Invalid authorization token");
        return createErrorResponse("Unauthorized: Invalid token", 401, requestOrigin);
      }
      
      // Parse request body
      let requestBody;
      try {
        requestBody = await req.json();
      } catch (e) {
        console.error("Failed to parse request body", e);
        return createErrorResponse("Invalid request body", 400, requestOrigin);
      }
      
      const { 
        extraction_id, 
        source_id,
        custom_query,
        preview_only = false, 
        limit = preview_only ? 5 : 250
      } = requestBody;
      
      console.log("Request parsed successfully", { 
        extraction_id, 
        source_id,
        has_custom_query: !!custom_query,
        preview_only,
        limit
      });
      
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
      console.error("Authentication error:", error);
      return createErrorResponse(
        "Authentication error: " + (error.message || "Unknown error"),
        401,
        requestOrigin
      );
    }
  } catch (error) {
    console.error("Extraction error:", error);
    
    return createErrorResponse(
      error.message || "An unknown error occurred", 
      500, 
      requestOrigin
    );
  }
});
