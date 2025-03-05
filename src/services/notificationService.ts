
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationCategory, NotificationSeverity } from "@/types/notification";
import { toast } from "@/hooks/use-toast";

// Get all notifications for the current user
export const fetchNotifications = async (days = 7): Promise<Notification[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase.rpc("get_user_notifications", {
      p_days: days,
      p_user_id: userData.user.id
    });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    
    return (data || []) as Notification[];
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

    const { data, error } = await supabase.rpc("mark_notification_read", {
      p_notification_id: id,
      p_user_id: userData.user.id
    });

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
    
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

    const { data, error } = await supabase.rpc("mark_all_notifications_read", {
      p_user_id: userData.user.id
    });

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
    
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

    const { data, error } = await supabase.rpc("create_notification", {
      p_title: title,
      p_description: description,
      p_severity: severity,
      p_category: category,
      p_link: options?.link,
      p_related_id: options?.related_id,
      p_read: false,
      p_user_id: userData.user.id
    });

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    // Show toast notification if requested
    if (options?.showToast !== false) {
      toast({
        title,
        description,
        variant: severity === "error" ? "destructive" : "default",
      });
    }

    return data as Notification;
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

    const { data, error } = await supabase.rpc("delete_old_notifications", {
      p_days: days,
      p_user_id: userData.user.id
    });

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

// Count unread notifications
export const countUnreadNotifications = async (): Promise<number> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase.rpc("count_unread_notifications", {
      p_user_id: userData.user.id
    });

    if (error) {
      console.error("Error counting unread notifications:", error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
};
