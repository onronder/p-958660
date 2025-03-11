
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { JobCreateData, validateJobStatus } from "./types";
import { createNotification } from "../notifications";

/**
 * Creates a new job in the system
 */
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
      is_deleted: jobData.is_deleted !== undefined ? jobData.is_deleted : false
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
