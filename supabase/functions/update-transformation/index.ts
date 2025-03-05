
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get and verify the JWT token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header missing" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    
    // Validate required fields
    if (!requestData.id) {
      return new Response(
        JSON.stringify({ error: "Transformation ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if transformation exists and belongs to user
    const { data: existingTransformation, error: checkError } = await supabase
      .from('transformations')
      .select('*')
      .eq('id', requestData.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingTransformation) {
      return new Response(
        JSON.stringify({ error: "Transformation not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare update data
    const updateData = {
      name: requestData.name || existingTransformation.name,
      expression: requestData.expression !== undefined ? requestData.expression : existingTransformation.expression,
      skip_transformation: requestData.skip_transformation !== undefined ? requestData.skip_transformation : existingTransformation.skip_transformation,
      status: requestData.status || existingTransformation.status,
      updated_at: new Date().toISOString()
    };

    // Update the transformation
    const { data: transformation, error: updateError } = await supabase
      .from('transformations')
      .update(updateData)
      .eq('id', requestData.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating transformation:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update transformation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ transformation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating transformation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
