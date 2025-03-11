
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    let body = {};
    if (req.method !== 'GET') {
      body = await req.json();
    }
    
    // Handle different actions based on the request
    const { action } = body;

    if (action === 'deleted') {
      // Get deleted sources for the authenticated user
      const { data: deletedSources, error: sourcesError } = await supabase
        .from('sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', true);

      if (sourcesError) {
        console.error("Error fetching deleted sources:", sourcesError);
        throw new Error("Error fetching deleted sources");
      }

      return new Response(
        JSON.stringify({ deletedSources: deletedSources || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'restore') {
      // Get source ID from request body
      const { sourceId } = body;
      
      if (!sourceId) {
        return new Response(
          JSON.stringify({ error: "Source ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the source belongs to the user and is deleted
      const { data: source, error: sourceError } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .eq('user_id', user.id)
        .eq('is_deleted', true)
        .single();

      if (sourceError || !source) {
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
        throw new Error("Failed to restore source");
      }

      return new Response(
        JSON.stringify({ success: true, source: updatedSource }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: List active sources (not deleted)
    const { data: sources, error: listError } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (listError) {
      console.error("Error fetching sources:", listError);
      throw new Error("Error fetching sources");
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
