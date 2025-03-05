
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

    // Get source ID from URL path
    const url = new URL(req.url);
    const sourceId = url.pathname.split('/').pop();

    if (!sourceId) {
      return new Response(
        JSON.stringify({ error: "Source ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if source exists
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      console.error("Source not found:", sourceError);
      return new Response(
        JSON.stringify({ error: "Source not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In a real implementation, we would fetch fields from the actual source
    // For now, we'll return mock fields based on the source type
    let fields = [];
    
    if (source.source_type === 'shopify') {
      fields = [
        { id: "1", name: "order_id", category: "Orders" },
        { id: "2", name: "customer_id", category: "Orders" },
        { id: "3", name: "total_price", category: "Orders" },
        { id: "4", name: "created_at", category: "Orders" },
        { id: "5", name: "first_name", category: "Customers" },
        { id: "6", name: "last_name", category: "Customers" },
        { id: "7", name: "email", category: "Customers" }
      ];
    } else if (source.source_type === 'woocommerce') {
      fields = [
        { id: "8", name: "product_id", category: "Products" },
        { id: "9", name: "product_name", category: "Products" },
        { id: "10", name: "sku", category: "Products" },
        { id: "11", name: "price", category: "Products" }
      ];
    }

    return new Response(
      JSON.stringify({ fields }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching fields:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
