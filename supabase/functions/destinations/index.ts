
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as getHandlers from "./get-handlers.ts";
import * as postHandlers from "./post-handlers.ts";
import * as patchHandlers from "./patch-handlers.ts";
import * as deleteHandlers from "./delete-handlers.ts";
import * as oauthHandlers from "./oauth-handlers.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: new Headers(corsHeaders),
    });
  }
  
  try {
    // Get the path and extract components
    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean);
    
    // Remove 'functions' and 'v1' from the path if present
    const apiPath = path.filter(p => p !== 'functions' && p !== 'v1');
    
    // Determine if we're handling oauth config
    if (apiPath.includes("oauth-config")) {
      return await oauthHandlers.handleOAuthConfig(req);
    }

    // Check if we're dealing with destinations
    if (apiPath[0] !== "destinations") {
      return new Response(JSON.stringify({ error: "Route not found" }), {
        status: 404,
        headers: new Headers({
          ...corsHeaders,
          "Content-Type": "application/json",
        }),
      });
    }

    // Extract the destination ID if present (destinations/:id)
    const destinationId = apiPath.length > 1 ? apiPath[1] : null;
    
    // Check for sub-resources (destinations/:id/restore)
    const subResource = apiPath.length > 2 ? apiPath[2] : null;
    
    // Log the request for debugging
    console.log(`Handling ${req.method} request for destinations:`, {
      path: apiPath,
      destinationId,
      subResource,
      url: url.toString()
    });
    
    // Handle different HTTP methods
    let response: Response;
    
    switch (req.method) {
      case "GET":
        if (destinationId) {
          response = await getHandlers.getDestinationById(req, destinationId);
        } else {
          response = await getHandlers.getDestinations(req);
        }
        break;
        
      case "POST":
        if (destinationId && subResource === "restore") {
          response = await postHandlers.restoreDestination(req, destinationId);
        } else {
          response = await postHandlers.createDestination(req);
        }
        break;
        
      case "PATCH":
        if (destinationId) {
          response = await patchHandlers.updateDestination(req, destinationId);
        } else {
          throw new Error("Destination ID is required for PATCH");
        }
        break;
        
      case "DELETE":
        if (destinationId) {
          response = await deleteHandlers.deleteDestination(req, destinationId, url);
        } else {
          throw new Error("Destination ID is required for DELETE");
        }
        break;
        
      default:
        throw new Error(`Method ${req.method} not implemented for this route`);
    }
    
    // Add CORS headers to the response
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
      }),
      {
        status: error.status || 500,
        headers: new Headers({
          ...corsHeaders,
          "Content-Type": "application/json",
        }),
      }
    );
  }
});

