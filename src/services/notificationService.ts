
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationCategory, NotificationSeverity } from "@/types/notification";
import { toast } from "@/hooks/use-toast";

// Get all notifications for the current user
export const fetchNotifications = async (days = 7): Promise<Notification[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Calculate date 7 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userData.user.id)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", userData.user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userData.user.id)
      .eq("read", false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Create a new notification
export const createNotification = async (
  title: string,
  description: string,
  severity: NotificationSeverity,
  category: NotificationCategory,
  options?: {
    link?: string;
    related_id?: string;
    showToast?: boolean;
  }
): Promise<Notification | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const notificationData = {
      title,
      description,
      severity,
      category,
      link: options?.link,
      related_id: options?.related_id,
      read: false,
      user_id: userData.user.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationData)
      .select();

    if (error) throw error;

    // Show toast notification if requested
    if (options?.showToast !== false) {
      toast({
        title,
        description,
        variant: severity === "error" ? "destructive" : "default",
      });
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Delete old notifications (older than specified days)
export const deleteOldNotifications = async (days = 7): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Calculate date X days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userData.user.id)
      .lt("created_at", cutoffDate.toISOString());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return false;
  }
};

// Count unread notifications
export const countUnreadNotifications = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("read", false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
};
