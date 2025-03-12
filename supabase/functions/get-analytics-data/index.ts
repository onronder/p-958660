
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Default synthetic data to use when not authenticated or errors occur
  const defaultData = {
    id: crypto.randomUUID(),
    user_id: "",
    etl_extraction: 35.8,
    etl_transformation: 28.6,
    etl_loading: 35.6,
    data_pull_frequency: [
      { time: '08:00', value: 3245 },
      { time: '10:00', value: 5621 },
      { time: '12:00', value: 8954 },
      { time: '14:00', value: 7632 },
      { time: '16:00', value: 9874 },
      { time: '18:00', value: 6584 }
    ],
    upload_success_rate: [
      { time: '08:00', value: 98 },
      { time: '10:00', value: 95 },
      { time: '12:00', value: 92 },
      { time: '14:00', value: 97 },
      { time: '16:00', value: 99 },
      { time: '18:00', value: 94 }
    ],
    data_size: [
      { month: 'Jan', value: 1240 },
      { month: 'Feb', value: 2150 },
      { month: 'Mar', value: 3620 },
      { month: 'Apr', value: 5840 },
      { month: 'May', value: 6950 },
      { month: 'Jun', value: 9720 }
    ],
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  // Get auth token from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.log("No Authorization header, returning default data");
    return new Response(
      JSON.stringify(defaultData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase client with auth context from the request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get user data to verify authentication
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      // Return default data instead of error
      return new Response(
        JSON.stringify(defaultData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching analytics data for user:", user.id);

    // Check if analytics data exists for this user
    const { data: analyticsCheck, error: analyticsCheckError } = await supabaseClient
      .from("analytics_data")
      .select("count(*)")
      .eq("user_id", user.id)
      .single();

    // If no analytics data exists, create synthetic data
    if (!analyticsCheck || analyticsCheck.count === 0 || analyticsCheckError) {
      console.log("No analytics data found, creating synthetic data for user:", user.id);
      
      // Create synthetic data with realistic patterns
      const syntheticData = {
        user_id: user.id,
        etl_extraction: 35.8,
        etl_transformation: 28.6,
        etl_loading: 35.6,
        data_pull_frequency: [
          { time: '08:00', value: 3245 },
          { time: '10:00', value: 5621 },
          { time: '12:00', value: 8954 },
          { time: '14:00', value: 7632 },
          { time: '16:00', value: 9874 },
          { time: '18:00', value: 6584 }
        ],
        upload_success_rate: [
          { time: '08:00', value: 98 },
          { time: '10:00', value: 95 },
          { time: '12:00', value: 92 },
          { time: '14:00', value: 97 },
          { time: '16:00', value: 99 },
          { time: '18:00', value: 94 }
        ],
        data_size: [
          { month: 'Jan', value: 1240 },
          { month: 'Feb', value: 2150 },
          { month: 'Mar', value: 3620 },
          { month: 'Apr', value: 5840 },
          { month: 'May', value: 6950 },
          { month: 'Jun', value: 9720 }
        ],
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      const { data: newAnalytics, error: insertError } = await supabaseClient
        .from("analytics_data")
        .upsert([syntheticData])
        .select("*")
        .single();

      if (insertError) {
        console.error("Error creating analytics data:", insertError);
        return new Response(
          JSON.stringify(defaultData),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(newAnalytics || defaultData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch analytics data for this user with more efficient query
    const { data: analyticsData, error: analyticsError } = await supabaseClient
      .from("analytics_data")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
      return new Response(
        JSON.stringify(defaultData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the response
    return new Response(
      JSON.stringify(analyticsData || defaultData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify(defaultData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
