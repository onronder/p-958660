
// Improved Edge Function for destinations to handle CORS properly
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import * as getHandlers from "./get-handlers.ts";
import * as postHandlers from "./post-handlers.ts";
import * as patchHandlers from "./patch-handlers.ts";
import * as deleteHandlers from "./delete-handlers.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: new Headers(corsHeaders),
    });
  }
  
  // Get the path and extract the ID if present
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  
  // Remove 'functions' and 'v1' from the path if present
  const apiPath = path.filter(p => p !== 'functions' && p !== 'v1');
  
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

  try {
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
    switch (req.method) {
      case "GET":
        if (destinationId) {
          return await getHandlers.getDestinationById(req, destinationId);
        } else {
          return await getHandlers.getDestinations(req);
        }
        
      case "POST":
        if (destinationId && subResource === "restore") {
          return await postHandlers.restoreDestination(req, destinationId);
        } else {
          return await postHandlers.createDestination(req);
        }
        
      case "PATCH":
        if (destinationId) {
          return await patchHandlers.updateDestination(req, destinationId);
        }
        break;
        
      case "DELETE":
        if (destinationId) {
          return await deleteHandlers.deleteDestination(req, destinationId, url);
        }
        break;
    }
    
    // If we reach here, the route is not implemented
    throw new Error("Method not implemented for this route");
    
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
