import { supabase } from "@/integrations/supabase/client";
import { Job, JobStatus } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { JobCreateData } from "./types";
import { createNotification } from "../notificationService";

// Create a new job
export const createJob = async (jobData: JobCreateData): Promise<Job | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    const jobToCreate = {
      ...jobData,
      description: jobData.description || null,
      transformation_id: jobData.transformation_id || null,
      destination_id: jobData.destination_id || null,
      user_id: userData.user.id,
      status: "active" as JobStatus, // Ensure status is always "active" for new jobs
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
