
import { supabase } from "@/integrations/supabase/client";
import { Job, JobStatus } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { JobCreateData, validateJobStatus } from "./types";
import { createNotification } from "../notificationService";

// Create a new job
export const createJob = async (jobData: JobCreateData): Promise<Job | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    // Make sure status is always a valid value that the database accepts
    const validStatus = validateJobStatus(jobData.status);
    
    const jobToCreate = {
      ...jobData,
      description: jobData.description || null,
      transformation_id: jobData.transformation_id || null,
      destination_id: jobData.destination_id || null,
      user_id: userData.user.id,
      status: validStatus,
    };
    
    console.log("Creating job with data:", JSON.stringify(jobToCreate, null, 2));
    
    // First, let's query the database to see what job statuses are actually accepted
    const { data: jobStatuses, error: statusError } = await supabase
      .from("jobs")
      .select("status")
      .limit(5);
    
    if (jobStatuses) {
      console.log("Example job statuses from database:", jobStatuses);
    }
    
    if (statusError) {
      console.error("Error checking job statuses:", statusError);
    }
    
    const { data, error } = await supabase
      .from("jobs")
      .insert(jobToCreate)
      .select("*")
      .single();
    
    if (error) {
      console.error("Error creating job:", error);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      console.error("Error message:", error.message);
      
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

// Toggle job status (active/paused)
export const toggleJobStatus = async (jobId: string, currentStatus: JobStatus): Promise<Job | null> => {
  try {
    // Toggle between active and paused status
    const newStatus: JobStatus = currentStatus === "active" ? "paused" : "active";
    
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
