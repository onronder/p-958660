
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
      JSON.stringify({ error: 'Authorization header is required' }),
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
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch metrics from the dashboard_metrics table
    const { data: metricsData, error: metricsError } = await supabaseClient
      .from("dashboard_metrics")
      .select("*")
      .eq("user_id", user.id);

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch metrics" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch job summary
    const { data: jobSummary, error: jobSummaryError } = await supabaseClient
      .from("job_summary")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (jobSummaryError) {
      console.error("Error fetching job summary:", jobSummaryError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch job summary" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent jobs (limit to last 5)
    const { data: recentJobs, error: jobsError } = await supabaseClient
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(5);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recent jobs" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format job data for the frontend
    const formattedJobs = recentJobs ? recentJobs.map(job => ({
      source: job.source_name,
      startDate: new Date(job.start_date).toISOString().split('T')[0],
      duration: job.duration || "00:05:30", // Default if null
      rowsProcessed: job.rows_processed,
      status: job.status,
    })) : [];

    // Process metrics into expected format
    const processedMetrics = {
      totalDataProcessed: 0,
      totalApiCalls: 0,
      activeConnections: 3, // Default value
      lastUpdated: null,
    };

    if (metricsData) {
      metricsData.forEach((metric) => {
        switch (metric.metric_name) {
          case "total_data_processed":
            processedMetrics.totalDataProcessed = metric.metric_value;
            processedMetrics.lastUpdated = metric.last_updated;
            break;
          case "total_api_calls":
            processedMetrics.totalApiCalls = metric.metric_value;
            break;
          case "active_connections":
            processedMetrics.activeConnections = metric.metric_value;
            break;
        }
      });
    }

    // Compile response data
    const responseData = {
      metrics: processedMetrics,
      jobSummary: jobSummary ? {
        totalJobs: jobSummary.total_jobs,
        successfulJobs: jobSummary.successful_jobs,
        failedJobs: jobSummary.failed_jobs,
        lastUpdated: jobSummary.last_updated,
      } : {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        lastUpdated: null,
      },
      recentJobs: formattedJobs,
    };

    // Return the response
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
