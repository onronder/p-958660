
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Triggers manual execution of a job
 */
export const triggerJobExecution = async (jobId: string): Promise<boolean> => {
  try {
    // Get the current user's ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error("No authenticated user found");
      toast({
        title: "Authentication Error",
        description: "You must be logged in to run jobs.",
        variant: "destructive",
      });
      return false;
    }

    // Call the job execution endpoint or function
    const { data, error } = await supabase
      .from("job_runs")
      .insert({ 
        job_id: jobId, 
        status: "Running",
        started_at: new Date().toISOString(),
        user_id: userData.user.id // Add the user_id field
      })
      .select("id")
      .single();
    
    if (error) {
      console.error("Error triggering job execution:", error);
      toast({
        title: "Error",
        description: "Failed to start job execution. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    // Update the job's last_run timestamp
    await supabase
      .from("jobs")
      .update({ 
        last_run: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);
    
    return true;
  } catch (error) {
    console.error("Error triggering job execution:", error);
    return false;
  }
};
