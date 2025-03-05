
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get auth token from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ 
        error: 'Authorization header is required',
        // Provide default data to prevent UI crashes
        id: "",
        user_id: "",
        etl_extraction: 33,
        etl_transformation: 33,
        etl_loading: 34,
        data_pull_frequency: [],
        upload_success_rate: [],
        data_size: [],
        last_updated: "",
        created_at: ""
      }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed",
          // Provide default data to prevent UI crashes
          id: "",
          user_id: "",
          etl_extraction: 33,
          etl_transformation: 33,
          etl_loading: 34,
          data_pull_frequency: [],
          upload_success_rate: [],
          data_size: [],
          last_updated: "",
          created_at: ""
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching analytics data for user:", user.id);

    // Fetch analytics data for this user with more efficient query
    const { data: analyticsData, error: analyticsError } = await supabaseClient
      .from("analytics_data")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (analyticsError) {
      console.error("Error fetching analytics data:", analyticsError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch analytics data",
          // Provide default data to prevent UI crashes
          id: "",
          user_id: user.id,
          etl_extraction: 33,
          etl_transformation: 33,
          etl_loading: 34,
          data_pull_frequency: [],
          upload_success_rate: [],
          data_size: [],
          last_updated: "",
          created_at: ""
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no analytics data found, create default entry
    if (!analyticsData) {
      console.log("No analytics data found, creating default entry");
      
      // Create default analytics data
      const defaultData = {
        user_id: user.id,
        etl_extraction: 33,
        etl_transformation: 33,
        etl_loading: 34,
        data_pull_frequency: [],
        upload_success_rate: [],
        data_size: [],
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      const { data: newAnalytics, error: insertError } = await supabaseClient
        .from("analytics_data")
        .insert([defaultData])
        .select("*")
        .single();

      if (insertError) {
        console.error("Error creating analytics data:", insertError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to initialize analytics data",
            ...defaultData
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(newAnalytics),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the response
    return new Response(
      JSON.stringify(analyticsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        // Provide default data to prevent UI crashes
        id: "",
        user_id: "",
        etl_extraction: 33,
        etl_transformation: 33,
        etl_loading: 34,
        data_pull_frequency: [],
        upload_success_rate: [],
        data_size: [],
        last_updated: "",
        created_at: ""
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
