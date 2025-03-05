
import { supabase } from "@/integrations/supabase/client";
import { Job, JobFrequency, JobStatus } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { NotificationSeverity, NotificationCategory } from "@/types/notification";

export const createJob = async (job: Omit<Job, "id" | "created_at" | "updated_at" | "user_id">): Promise<Job | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase.from("jobs").insert({
      ...job,
      user_id: userData.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select();

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Create notification about job creation
    await createNotification({
      title: "Job Created",
      description: `New job "${job.name}" has been scheduled.`,
      severity: "info",
      category: "job",
      related_id: data[0].id
    });

    return data[0];
  } catch (error) {
    console.error("Error creating job:", error);
    toast({
      title: "Error creating job",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    return null;
  }
};

export const updateJob = async (id: string, updates: Partial<Job>): Promise<Job | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase.from("jobs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userData.user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Create notification about job update
    await createNotification({
      title: "Job Updated",
      description: `Job "${data[0].name}" has been updated.`,
      severity: "info",
      category: "job",
      related_id: id
    });

    return data[0];
  } catch (error) {
    console.error("Error updating job:", error);
    toast({
      title: "Error updating job",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    return null;
  }
};

export const toggleJobStatus = async (id: string, currentStatus: JobStatus): Promise<Job | null> => {
  const newStatus = currentStatus === "Active" ? "Paused" : "Active";
  return updateJob(id, { status: newStatus });
};

export const deleteJob = async (id: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Get job name before deleting
    const { data: jobData } = await supabase.from("jobs")
      .select("name")
      .eq("id", id)
      .eq("user_id", userData.user.id)
      .single();

    const { error } = await supabase.from("jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", userData.user.id);

    if (error) throw error;

    // Create notification about job deletion
    if (jobData) {
      await createNotification({
        title: "Job Deleted",
        description: `Job "${jobData.name}" has been deleted.`,
        severity: "info",
        category: "job"
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    toast({
      title: "Error deleting job",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    return false;
  }
};

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase.from("jobs")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    toast({
      title: "Error fetching jobs",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    return [];
  }
};

// Function to calculate next run time based on frequency and schedule
export const calculateNextRun = (frequency: JobFrequency, schedule: string): string => {
  const now = new Date();
  let nextRun = new Date();

  switch (frequency) {
    case "Once":
      // For one-time jobs, we use the schedule as the exact date/time
      nextRun = new Date(schedule);
      break;
    case "Hourly":
      // For hourly, we add one hour
      nextRun.setHours(nextRun.getHours() + 1);
      break;
    case "Daily":
      // For daily, we use the time from schedule and set it for the next day
      const [dailyHours, dailyMinutes] = schedule.split(':').map(Number);
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(dailyHours, dailyMinutes, 0, 0);
      break;
    case "Weekly":
      // For weekly, schedule format is "DAY HH:MM" (e.g., "Monday 08:00")
      const [weekDay, weekTime] = schedule.split(' ');
      const [weekHours, weekMinutes] = weekTime.split(':').map(Number);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetDay = days.indexOf(weekDay);
      let daysToAdd = (targetDay + 7 - now.getDay()) % 7;
      if (daysToAdd === 0) daysToAdd = 7; // Next week if today is the target day
      nextRun.setDate(nextRun.getDate() + daysToAdd);
      nextRun.setHours(weekHours, weekMinutes, 0, 0);
      break;
    case "Monthly":
      // For monthly, schedule format is "DAY HH:MM" (e.g., "15 08:00")
      const [monthDay, monthTime] = schedule.split(' ');
      const [monthHours, monthMinutes] = monthTime.split(':').map(Number);
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(parseInt(monthDay));
      nextRun.setHours(monthHours, monthMinutes, 0, 0);
      break;
  }

  return nextRun.toISOString();
};

// Function to trigger job execution
export const triggerJobExecution = async (jobId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Get the job details
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userData.user.id)
      .single();

    if (jobError || !jobData) throw new Error(jobError?.message || "Job not found");

    // Insert a new entry in the job_runs table using RPC call
    const { data: runData, error: runError } = await supabase.rpc("insert_job_run", {
      p_job_id: jobId,
      p_status: "Running",
      p_user_id: userData.user.id
    });

    if (runError) throw runError;
    
    const runId = runData?.id;
    if (!runId) throw new Error("Failed to create job run");

    // Call appropriate function based on job configuration
    try {
      // If job has transformation_id, apply the transformation
      if (jobData.transformation_id) {
        const response = await supabase.functions.invoke('apply-transformation', {
          body: { transformation_id: jobData.transformation_id }
        });
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Error applying transformation");
        }
      }
      
      // If job has destination_id, export to destination
      if (jobData.destination_id) {
        const response = await supabase.functions.invoke('export-to-destination', {
          body: { destination_id: jobData.destination_id }
        });
        
        if (!response.data || response.data.error) {
          throw new Error(response.data?.error || "Error exporting to destination");
        }
      }
      
      // Update job run status to Success using RPC call
      await supabase.rpc("update_job_run_success", {
        p_run_id: runId,
        p_rows_processed: Math.floor(Math.random() * 10000) // Mock data for demo purposes
      });
      
      // Update job last_run and next_run
      const nextRun = calculateNextRun(jobData.frequency, jobData.schedule);
      await updateJob(jobId, {
        last_run: new Date().toISOString(),
        next_run: nextRun,
        status: jobData.frequency === "Once" ? "Completed" : "Active"
      });
      
      // Create success notification
      await createNotification({
        title: "Job Succeeded",
        description: `Job "${jobData.name}" completed successfully.`,
        severity: "success",
        category: "job",
        related_id: jobId
      });
      
      return true;
    } catch (error) {
      // Update job run status to Failed using RPC call
      await supabase.rpc("update_job_run_failed", {
        p_run_id: runId,
        p_error_message: error instanceof Error ? error.message : "Unknown error"
      });
      
      // Create failure notification
      await createNotification({
        title: "Job Failed",
        description: `Job "${jobData.name}" failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        severity: "error",
        category: "job",
        related_id: jobId
      });
      
      throw error;
    }
  } catch (error) {
    console.error("Error executing job:", error);
    toast({
      title: "Error executing job",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    return false;
  }
};

// Helper function to create notification
export const createNotification = async (notification: {
  title: string;
  description: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  read?: boolean;
  link?: string;
  related_id?: string;
}): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { error } = await supabase.rpc("create_notification", {
      p_title: notification.title,
      p_description: notification.description,
      p_severity: notification.severity,
      p_category: notification.category,
      p_read: notification.read || false,
      p_link: notification.link,
      p_related_id: notification.related_id,
      p_user_id: userData.user.id
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};
