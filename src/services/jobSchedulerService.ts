
import { supabase } from "@/integrations/supabase/client";
import { Job, JobFrequency, JobStatus, JobRun } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { format, addHours, addDays, addMonths, parseISO, setHours, setMinutes } from "date-fns";
import { createNotification } from "./notificationService";

// Create a new job
export const createJob = async (jobData: Omit<Job, "id" | "created_at" | "updated_at" | "user_id" | "last_run">): Promise<Job | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    // Make sure status is a valid enum value
    const validStatus: JobStatus = (jobData.status as JobStatus) || "Active";
    
    const jobToCreate = {
      ...jobData,
      description: jobData.description || null, // Ensure description is null if empty/undefined
      user_id: userData.user.id,
      status: validStatus,
    };
    
    console.log("Creating job with data:", jobToCreate);
    
    const { data, error } = await supabase
      .from("jobs")
      .insert(jobToCreate)
      .select("*")
      .single();
    
    if (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
      return null;
    }
    
    // Create notification for job creation
    await createNotification(
      "Job Created",
      `Your job "${data.name}" has been scheduled.`,
      "success",
      "job",
      { related_id: data.id }
    );
    
    return data as Job;
  } catch (error) {
    console.error("Error creating job:", error);
    return null;
  }
};

// Toggle job status (Active/Paused)
export const toggleJobStatus = async (jobId: string, currentStatus: JobStatus): Promise<Job | null> => {
  try {
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";
    
    const { data, error } = await supabase
      .from("jobs")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", jobId)
      .select("*")
      .single();
    
    if (error) {
      console.error("Error toggling job status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
      return null;
    }
    
    return data as Job;
  } catch (error) {
    console.error("Error toggling job status:", error);
    return null;
  }
};

// Delete a job
export const deleteJob = async (jobId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);
    
    if (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    return false;
  }
};

// Fetch all jobs
export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
    
    return data as Job[];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

// Calculate next run time based on frequency and schedule
export const calculateNextRun = (frequency: JobFrequency, schedule: string): string => {
  const now = new Date();
  
  switch (frequency) {
    case "Once":
      return schedule; // For one-time jobs, the schedule is the exact date/time
      
    case "Hourly":
      // Schedule next run at the next hour
      return addHours(now, 1).toISOString();
      
    case "Daily":
      // Parse the time (e.g., "08:30") and set it for tomorrow
      try {
        const [hours, minutes] = schedule.split(":").map(Number);
        let nextRun = new Date(now);
        nextRun = setHours(nextRun, hours);
        nextRun = setMinutes(nextRun, minutes);
        
        // If the time has already passed today, schedule for tomorrow
        if (nextRun <= now) {
          nextRun = addDays(nextRun, 1);
        }
        
        return nextRun.toISOString();
      } catch (error) {
        console.error("Error calculating daily schedule:", error);
        return addDays(now, 1).toISOString();
      }
      
    case "Weekly":
      // Parse the day and time (e.g., "Monday 08:30")
      try {
        const [day, time] = schedule.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = now.getDay();
        const targetDay = daysOfWeek.indexOf(day);
        
        // Calculate days until the next occurrence of the target day
        let daysUntilTarget = targetDay - today;
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7;
        }
        
        let nextRun = addDays(now, daysUntilTarget);
        nextRun = setHours(nextRun, hours);
        nextRun = setMinutes(nextRun, minutes);
        
        return nextRun.toISOString();
      } catch (error) {
        console.error("Error calculating weekly schedule:", error);
        return addDays(now, 7).toISOString();
      }
      
    case "Monthly":
      // Parse the day of month and time (e.g., "15 08:30")
      try {
        const [dayOfMonth, time] = schedule.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        
        // Create date for the next occurrence of the specified day of month
        let nextRun = new Date(now.getFullYear(), now.getMonth(), parseInt(dayOfMonth));
        
        // If that day has already passed this month, move to next month
        if (nextRun <= now) {
          nextRun = new Date(now.getFullYear(), now.getMonth() + 1, parseInt(dayOfMonth));
        }
        
        nextRun = setHours(nextRun, hours);
        nextRun = setMinutes(nextRun, minutes);
        
        return nextRun.toISOString();
      } catch (error) {
        console.error("Error calculating monthly schedule:", error);
        return addMonths(now, 1).toISOString();
      }
      
    default:
      return now.toISOString();
  }
};

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
