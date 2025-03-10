
import { supabase } from "@/integrations/supabase/client";

// Delete old notifications (older than specified days)
export const deleteOldNotifications = async (days = 7): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Calculate the date to delete notifications older than
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - days);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userData.user.id)
      .lt('created_at', deleteDate.toISOString());

    if (error) {
      console.error("Error deleting old notifications:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return false;
  }
};
