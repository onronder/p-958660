
import { supabase } from "@/integrations/supabase/client";
import { Job, JobStatus } from "@/types/job";
import { toast } from "@/hooks/use-toast";

/**
 * Toggles job status between active and paused
 */
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
