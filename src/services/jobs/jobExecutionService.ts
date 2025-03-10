
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { calculateNextRun } from "./jobSchedulerService";
import { createNotification } from "../notificationService";

// Trigger a job execution immediately
export const triggerJobExecution = async (jobId: string): Promise<boolean> => {
  try {
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();
    
    if (jobError || !jobData) {
      console.error("Error fetching job:", jobError);
      toast({
        title: "Error",
        description: "Failed to trigger job execution. Job not found.",
        variant: "destructive",
      });
      return false;
    }
    
    const job = jobData as Job;
    
    // Create a job run record
    const { data: jobRun, error: runError } = await supabase
      .from("job_runs")
      .insert({
        job_id: job.id,
        status: "Running",
        user_id: job.user_id,
      })
      .select("*")
      .single();
    
    if (runError || !jobRun) {
      console.error("Error creating job run:", runError);
      return false;
    }
    
    // Update job's last_run time
    await supabase
      .from("jobs")
      .update({
        last_run: new Date().toISOString(),
        next_run: calculateNextRun(job.frequency, job.schedule),
        updated_at: new Date().toISOString()
      })
      .eq("id", job.id);
    
    // Process the job based on its type
    let success = false;
    let rowsProcessed = 0;
    let errorMessage = '';
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Different processing based on job type or associated resources
      if (job.transformation_id && job.destination_id) {
        // Process full ETL job (extract, transform, load)
        console.log(`Processing ETL job with transformation: ${job.transformation_id} and destination: ${job.destination_id}`);
        rowsProcessed = Math.floor(Math.random() * 1500) + 200; // Simulate rows processed
        success = true;
      } else if (job.transformation_id) {
        // Process transformation job only
        console.log(`Processing transformation job for transformation: ${job.transformation_id}`);
        rowsProcessed = Math.floor(Math.random() * 1000) + 100; // Simulate rows processed
        success = true;
      } else if (job.destination_id) {
        // Process export job only
        console.log(`Processing export job for destination: ${job.destination_id}`);
        rowsProcessed = Math.floor(Math.random() * 500) + 50; // Simulate rows processed
        success = true;
      } else {
        // Generic job processing (extract only)
        console.log(`Processing generic extraction job: ${job.name}`);
        rowsProcessed = Math.floor(Math.random() * 200) + 20; // Simulate rows processed
        success = true;
      }
    } catch (error) {
      console.error("Error processing job:", error);
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    }
    
    // Update job run with results
    if (success) {
      const { error: updateError } = await supabase
        .from("job_runs")
        .update({
          status: "Success",
          completed_at: new Date().toISOString(),
          rows_processed: rowsProcessed
        })
        .eq("id", jobRun.id);
      
      if (updateError) {
        console.error("Error updating job run:", updateError);
      }
      
      // Create success notification
      await createNotification(
        "Job Completed",
        `Job "${job.name}" completed successfully. Processed ${rowsProcessed} rows.`,
        "success",
        "job",
        { related_id: job.id }
      );
    } else {
      const { error: updateError } = await supabase
        .from("job_runs")
        .update({
          status: "Failed",
          completed_at: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq("id", jobRun.id);
      
      if (updateError) {
        console.error("Error updating job run:", updateError);
      }
      
      // Create failure notification
      await createNotification(
        "Job Failed",
        `Job "${job.name}" failed: ${errorMessage}`,
        "error",
        "job",
        { related_id: job.id }
      );
    }
    
    return success;
  } catch (error) {
    console.error("Error triggering job execution:", error);
    return false;
  }
};
