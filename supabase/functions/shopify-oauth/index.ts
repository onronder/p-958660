
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  logEnvironmentVariables, 
  validateEnvironmentVariables,
  createErrorResponse
} from "./utils.ts";
import {
  handleOAuthCallback,
  generateAuthUrl,
  saveToken,
  testConnection
} from "./handlers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment variables availability
    logEnvironmentVariables();
    
    // Validate required environment variables
    try {
      validateEnvironmentVariables();
    } catch (error) {
      return createErrorResponse(
        "Server configuration issue - missing required environment variables",
        500
      );
    }

    // Get the request URL and determine the requested action
    const { pathname } = new URL(req.url);
    console.log("Request to endpoint:", pathname);

    // Check if this is a direct URL call (callback) or an action from the frontend
    if (pathname.includes("/callback")) {
      return handleOAuthCallback(req);
    } else {
      // Handle action-based requests from the frontend
      const requestData = await req.json();
      const { action, store_name, user_id, access_token, source_name } = requestData;
      
      console.log("Received action:", action);
      
      switch (action) {
        case "authenticate":
          return generateAuthUrl(store_name);
          
        case "save_token":
          return saveToken(user_id, store_name, access_token, source_name);
          
        case "test_connection":
          return testConnection(store_name, access_token);
          
        default:
          console.error("Unknown action requested:", action);
          return createErrorResponse("Unknown action", 400);
      }
    }
  } 
  catch (error) {
    console.error("Error in edge function:", error);
    return createErrorResponse(
      error.message || "Unknown error",
      500,
      { stack: error.stack }
    );
  }
});
