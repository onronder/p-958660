
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

console.log("sources function initialized");

serve(async (req) => {
  console.log("sources function called:", req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Unauthorized: ", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    console.log("Processing path:", path);

    // Get request body for non-GET requests
    let body = {};
    if (req.method !== 'GET') {
      body = await req.json();
      console.log("Request body:", body);
    }
    
    // Handle different actions based on the request path and body
    if (path === 'restore' || body.action === 'restore') {
      // Get source ID from request body or URL params
      let sourceId = body.sourceId;
      
      if (!sourceId) {
        console.error("Source ID is required for restore");
        return new Response(
          JSON.stringify({ error: "Source ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Restoring source:", sourceId);

      // Verify the source belongs to the user and is deleted
      const { data: source, error: sourceError } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .eq('user_id', user.id)
        .eq('is_deleted', true)
        .single();

      if (sourceError || !source) {
        console.error("Source not found or not accessible:", sourceError);
        return new Response(
          JSON.stringify({ error: "Source not found or not accessible" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Restore the source
      const { data: updatedSource, error: updateError } = await supabase
        .from('sources')
        .update({ 
          is_deleted: false,
          deletion_marked_at: null,
          status: 'Inactive'
        })
        .eq('id', sourceId)
        .select()
        .single();

      if (updateError) {
        console.error("Error restoring source:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to restore source" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, source: updatedSource }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (path === 'deleted' || body.action === 'deleted') {
      console.log("Fetching deleted sources for user:", user.id);
      // Get deleted sources for the authenticated user
      const { data: deletedSources, error: sourcesError } = await supabase
        .from('sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', true);

      if (sourcesError) {
        console.error("Error fetching deleted sources:", sourcesError);
        return new Response(
          JSON.stringify({ error: "Error fetching deleted sources" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ deletedSources: deletedSources || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: List active sources (not deleted)
    console.log("Fetching active sources for user:", user.id);
    const { data: sources, error: listError } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (listError) {
      console.error("Error fetching sources:", listError);
      return new Response(
        JSON.stringify({ error: "Error fetching sources" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sources: sources || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
