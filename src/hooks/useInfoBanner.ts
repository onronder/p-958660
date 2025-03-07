
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useInfoBanner(messageId: string) {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Check if this message has been dismissed previously
    const checkIfDismissed = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("dismissed_help_messages")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching dismissed messages:", error);
          return;
        }

        // Check if this messageId is in the dismissed_help_messages array
        if (data?.dismissed_help_messages && Array.isArray(data.dismissed_help_messages)) {
          if (data.dismissed_help_messages.includes(messageId)) {
            setIsVisible(false);
          }
        }
      } catch (error) {
        console.error("Error checking dismissed messages:", error);
      }
    };

    checkIfDismissed();
  }, [messageId, user]);

  const dismissMessage = async () => {
    if (!user) {
      // If no user is logged in, just hide the banner without saving preference
      setIsVisible(false);
      return;
    }

    try {
      // Call the Supabase function to dismiss the message
      const { data, error } = await supabase.rpc(
        "dismiss_help_message", 
        { 
          message_id: messageId,
          p_user_id: user.id
        }
      );

      if (error) {
        console.error("Error dismissing message:", error);
        return;
      }

      // Hide the banner
      setIsVisible(false);
    } catch (error) {
      console.error("Error dismissing message:", error);
    }
  };

  return { isVisible, dismissMessage };
}
