
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";

/**
 * Fetches all jobs for the current user
 */
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
    
    // Use a more direct type assertion to avoid deep instantiation
    return (data as Job[]) || [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

/**
 * Fetches only deleted jobs for the current user
 */
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
    
    // Use a more direct type assertion to avoid deep instantiation
    return (data as Job[]) || [];
  } catch (error) {
    console.error("Error fetching deleted jobs:", error);
    return [];
  }
};
