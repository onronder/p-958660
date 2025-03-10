
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "@/hooks/use-toast";
import { NotificationCreate } from "./types";

// Fetch all notifications for the current user
export const fetchNotifications = async (days = 7): Promise<Notification[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

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

// Create a new notification
export const createNotification = async (
  title: string,
  description: string,
  severity: string,
  category: string,
  options?: {
    link?: string;
    related_id?: string;
    showToast?: boolean;
  }
): Promise<Notification | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title,
        description,
        severity,
        category,
        link: options?.link,
        related_id: options?.related_id,
        read: false,
        user_id: userData.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

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
