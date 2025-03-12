
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { defaultData } from "./defaultData.ts";

// Fetch and process metrics data
export async function fetchMetricsData(supabaseClient: SupabaseClient, userId: string) {
  const { data: metrics, error: metricsError } = await supabaseClient
    .from("dashboard_metrics")
    .select("*")
    .eq("user_id", userId);

  if (metricsError) {
    console.error("Error fetching metrics:", metricsError);
    return null;
  }

  return metrics;
}

// Fetch job summary data
export async function fetchJobSummary(supabaseClient: SupabaseClient, userId: string) {
  const { data: jobSummary, error: jobSummaryError } = await supabaseClient
    .from("job_summary")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (jobSummaryError) {
    console.error("Error fetching job summary:", jobSummaryError);
    return null;
  }

  return jobSummary;
}

// Fetch recent jobs data
export async function fetchRecentJobs(supabaseClient: SupabaseClient, userId: string) {
  const { data: recentJobs, error: jobsError } = await supabaseClient
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(5);

  if (jobsError) {
    console.error("Error fetching jobs:", jobsError);
    return null;
  }

  return recentJobs;
}

// Process metrics data into the expected format
export function processMetricsData(metrics: any[] | null) {
  const processedMetrics = {
    totalDataProcessed: 0,
    totalApiCalls: 0,
    activeConnections: 3, // Default value
    lastUpdated: null,
  };

  if (metrics) {
    metrics.forEach((metric) => {
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

  return processedMetrics;
}

// Format job data for the frontend
export function formatJobsData(recentJobs: any[] | null) {
  if (!recentJobs) return defaultData.recentJobs;
  
  return recentJobs.map(job => ({
    source: job.source_name,
    startDate: new Date(job.start_date).toISOString().split('T')[0],
    duration: job.duration || "00:05:30", // Default if null
    rowsProcessed: job.rows_processed,
    status: job.status,
  }));
}

// Format job summary data
export function formatJobSummary(jobSummary: any | null) {
  if (!jobSummary) return defaultData.jobSummary;
  
  return {
    totalJobs: jobSummary.total_jobs,
    successfulJobs: jobSummary.successful_jobs,
    failedJobs: jobSummary.failed_jobs,
    lastUpdated: jobSummary.last_updated,
  };
}

// Compile all dashboard data
export async function fetchDashboardData(supabaseClient: SupabaseClient, userId: string) {
  // Fetch all data concurrently for better performance
  const [metrics, jobSummary, recentJobs] = await Promise.all([
    fetchMetricsData(supabaseClient, userId),
    fetchJobSummary(supabaseClient, userId),
    fetchRecentJobs(supabaseClient, userId)
  ]);

  // Process and format the data
  const processedMetrics = processMetricsData(metrics);
  const formattedJobSummary = formatJobSummary(jobSummary);
  const formattedJobs = formatJobsData(recentJobs);

  // Compile response data
  return {
    metrics: processedMetrics,
    jobSummary: formattedJobSummary,
    recentJobs: formattedJobs.length > 0 ? formattedJobs : defaultData.recentJobs,
  };
}
