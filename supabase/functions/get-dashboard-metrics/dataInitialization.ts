
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize synthetic metrics data if none exists
export async function initializeMetricsData(supabaseClient: SupabaseClient, userId: string): Promise<void> {
  console.log("Creating synthetic metrics data for user:", userId);
  
  // Insert synthetic metrics for development/testing
  const metrics = [
    { 
      user_id: userId, 
      metric_name: 'total_data_processed', 
      metric_value: 1258.45,
      last_updated: new Date().toISOString()
    },
    { 
      user_id: userId, 
      metric_name: 'total_api_calls', 
      metric_value: 8764,
      last_updated: new Date().toISOString()
    },
    { 
      user_id: userId, 
      metric_name: 'active_connections', 
      metric_value: 12,
      last_updated: new Date().toISOString()
    }
  ];
  
  // Insert metrics one by one to avoid errors
  for (const metric of metrics) {
    await supabaseClient.from("dashboard_metrics").upsert(metric);
  }
}

// Initialize synthetic job summary if none exists
export async function initializeJobSummary(supabaseClient: SupabaseClient, userId: string): Promise<void> {
  console.log("Creating synthetic job summary for user:", userId);
  
  await supabaseClient.from("job_summary").upsert({
    user_id: userId,
    total_jobs: 156,
    successful_jobs: 142,
    failed_jobs: 14,
    last_updated: new Date().toISOString()
  });
}

// Initialize synthetic jobs if none exists
export async function initializeJobs(supabaseClient: SupabaseClient, userId: string): Promise<void> {
  console.log("Creating synthetic jobs for user:", userId);
  
  // Create synthetic jobs for development/testing
  const jobs = [];
  for (let i = 1; i <= 5; i++) {
    const job = {
      name: `Job ${i}`,
      source_name: `Source ${(i % 3) + 1}`,
      user_id: userId,
      status: i % 3 === 0 ? 'failed' : (i % 4 === 0 ? 'running' : 'success'),
      rows_processed: Math.floor(Math.random() * 10000) + 500,
      start_date: new Date(Date.now() - (i * 3600000)).toISOString(),
      duration: `00:${10 + i}:00`,
      last_run: new Date(Date.now() - (i * 3600000)).toISOString(),
      next_run: new Date(Date.now() + (i * 7200000)).toISOString(),
      frequency: i % 3 === 0 ? 'Daily' : (i % 3 === 1 ? 'Weekly' : 'Monthly'),
      schedule: i % 3 === 0 ? '09:00' : (i % 3 === 1 ? '16:30' : '00:15')
    };
    jobs.push(job);
  }
  
  // Insert jobs one by one to avoid errors
  for (const job of jobs) {
    await supabaseClient.from("jobs").upsert(job);
  }
}

// Check data existence and initialize if needed
export async function ensureUserDataExists(supabaseClient: SupabaseClient, userId: string): Promise<void> {
  // Check if metrics exist
  const { data: metricsCheck, error: metricsCheckError } = await supabaseClient
    .from("dashboard_metrics")
    .select("count(*)")
    .eq("user_id", userId)
    .single();

  if (!metricsCheck || metricsCheck.count === 0 || metricsCheckError) {
    await initializeMetricsData(supabaseClient, userId);
  }

  // Check if job summary exists
  const { data: jobSummaryCheck, error: jobSummaryCheckError } = await supabaseClient
    .from("job_summary")
    .select("count(*)")
    .eq("user_id", userId)
    .single();

  if (!jobSummaryCheck || jobSummaryCheck.count === 0 || jobSummaryCheckError) {
    await initializeJobSummary(supabaseClient, userId);
  }

  // Check if jobs exist
  const { data: jobsCheck, error: jobsCheckError } = await supabaseClient
    .from("jobs")
    .select("count(*)")
    .eq("user_id", userId)
    .single();

  if (!jobsCheck || jobsCheck.count === 0 || jobsCheckError) {
    await initializeJobs(supabaseClient, userId);
  }
}
