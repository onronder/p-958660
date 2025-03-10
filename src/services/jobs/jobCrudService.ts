
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
      is_deleted: false
    };
    
    console.log("Creating job with data:", JSON.stringify(jobToCreate, null, 2));
    
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

// Soft delete a job
export const deleteJob = async (jobId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("jobs")
      .update({ 
        is_deleted: true, 
        status: "paused", // Stop the job when it's deleted
        deletion_marked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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
    
    // Create notification for job deletion
    await createNotification(
      "Job Deleted",
      `Your job has been moved to deleted jobs. It will be permanently removed in 30 days.`,
      "info",
      "job",
      { related_id: jobId }
    );
    
    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    return false;
  }
};

// Permanently delete a job
export const permanentlyDeleteJob = async (jobId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);
    
    if (error) {
      console.error("Error permanently deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to permanently delete job. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error permanently deleting job:", error);
    return false;
  }
};

// Restore a deleted job
export const restoreJob = async (jobId: string): Promise<Job | null> => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .update({ 
        is_deleted: false, 
        deletion_marked_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)
      .select("*")
      .single();
    
    if (error) {
      console.error("Error restoring job:", error);
      toast({
        title: "Error",
        description: "Failed to restore job. Please try again.",
        variant: "destructive",
      });
      return null;
    }
    
    // Create notification for job restoration
    await createNotification(
      "Job Restored",
      `Your job "${data.name}" has been restored.`,
      "success",
      "job",
      { related_id: jobId }
    );
    
    return data as Job;
  } catch (error) {
    console.error("Error restoring job:", error);
    return null;
  }
};

// Fetch all jobs
export const fetchJobs = async (includeDeleted: boolean = false): Promise<Job[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userData.user.id);
    
    if (!includeDeleted) {
      query = query.eq("is_deleted", false);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
    
    // Resolve type instantiation issue by using a simple type assertion without deep nesting
    return (data || []) as Job[];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

// Fetch only deleted jobs
export const fetchDeletedJobs = async (): Promise<Job[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("is_deleted", true)
      .order("deletion_marked_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching deleted jobs:", error);
      return [];
    }
    
    // Resolve type instantiation issue by using a simple type assertion without deep nesting
    return (data || []) as Job[];
  } catch (error) {
    console.error("Error fetching deleted jobs:", error);
    return [];
  }
};
