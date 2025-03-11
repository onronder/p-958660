
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { createNotification } from "../notifications";

/**
 * Marks a job as deleted (soft delete)
 */
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

/**
 * Permanently deletes a job from the database
 */
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

/**
 * Restores a previously deleted job
 */
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
