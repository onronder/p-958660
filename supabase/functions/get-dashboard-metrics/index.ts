
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCorsPreflightRequest } from "./corsHelpers.ts";
import { defaultData } from "./defaultData.ts";
import { ensureUserDataExists } from "./dataInitialization.ts";
import { fetchDashboardData } from "./dataService.ts";

serve(async (req) => {
  // Handle CORS preflight request
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Get auth token from the Authorization header
    const authHeader = req.headers.get('Authorization');

    // If no auth header is provided, return default data
    if (!authHeader) {
      console.log('No authorization header found, returning default data');
      return new Response(
        JSON.stringify(defaultData),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        },
      }
    );

    // Get user data to verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    // If authentication fails, return default data rather than an error
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify(defaultData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching dashboard data for user:", user.id);

    // Ensure that user has the necessary data (initialize if needed)
    await ensureUserDataExists(supabaseClient, user.id);

    // Fetch all dashboard data
    const responseData = await fetchDashboardData(supabaseClient, user.id);

    // Return the response
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        ...defaultData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
