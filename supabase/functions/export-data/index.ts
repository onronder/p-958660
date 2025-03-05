
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
    if (!requestData.source_id) {
      return new Response(
        JSON.stringify({ error: "Source ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if source exists
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', requestData.source_id)
      .eq('user_id', user.id)
      .single();

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: "Source not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In a real implementation, we would export the data here
    // For now, we'll return mock data
    const mockData = [
      { order_id: "1001", customer_id: "C1001", total_price: 99.99, created_at: "2023-11-22" },
      { order_id: "1002", customer_id: "C1002", total_price: 149.99, created_at: "2023-11-23" },
      { order_id: "1003", customer_id: "C1003", total_price: 199.99, created_at: "2023-11-24" }
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: mockData,
        message: "Data exported successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error exporting data:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
