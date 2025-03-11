
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, parsePathForId, createResponse } from './utils.ts';
import { handleGetAllDestinations } from './get-handlers.ts';
import { handleCreateDestination, handleRestoreDestination } from './post-handlers.ts';
import { handleUpdateDestination } from './patch-handlers.ts';
import { handleDeleteDestination } from './delete-handlers.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      } 
    });
  }

  try {
    // Parse the URL to get the path and any query parameters
    const url = new URL(req.url);
    const path = url.pathname;
    const pathParts = path.split('/').filter(Boolean);
    const id = pathParts.length > 1 ? pathParts[1] : null;

    // Check if this is a restore operation
    if (pathParts.length > 2 && pathParts[2] === 'restore') {
      if (req.method === 'POST' && id) {
        return await handleRestoreDestination(req, id);
      }
    }

    // Handle other operations based on HTTP method
    switch (req.method) {
      case 'GET':
        return await handleGetAllDestinations(req);

      case 'POST':
        return await handleCreateDestination(req);

      case 'PATCH':
        if (!id) {
          return createResponse({ error: 'Destination ID is required' }, 400);
        }
        return await handleUpdateDestination(req, id);

      case 'DELETE':
        if (!id) {
          return createResponse({ error: 'Destination ID is required' }, 400);
        }
        return await handleDeleteDestination(req, id);

      default:
        return createResponse({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return createResponse({ 
      error: 'Internal server error', 
      details: error.message 
    }, 500);
  }
});
