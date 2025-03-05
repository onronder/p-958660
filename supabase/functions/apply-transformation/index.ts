
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
    if (!requestData.transformation_id) {
      return new Response(
        JSON.stringify({ error: "Transformation ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if transformation exists
    const { data: transformation, error: getError } = await supabase
      .from('transformations')
      .select('*')
      .eq('id', requestData.transformation_id)
      .eq('user_id', user.id)
      .single();

    if (getError || !transformation) {
      return new Response(
        JSON.stringify({ error: "Transformation not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In a real implementation, we would apply the transformation here
    // For now, we'll simulate the process with a delay and return a success message
    
    // Update transformation status to Processing
    await supabase
      .from('transformations')
      .update({ status: 'Processing' })
      .eq('id', requestData.transformation_id);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update transformation status back to Active
    await supabase
      .from('transformations')
      .update({ status: 'Active' })
      .eq('id', requestData.transformation_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Transformation applied successfully",
        preview: [
          { order_id: "1001", total_price: 99.99, derived_price: 119.99 },
          { order_id: "1002", total_price: 149.99, derived_price: 179.99 },
          { order_id: "1003", total_price: 199.99, derived_price: 239.99 }
        ]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error applying transformation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
