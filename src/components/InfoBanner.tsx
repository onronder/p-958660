
import React, { useState, useEffect } from "react";
import { InfoIcon, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface InfoBannerProps {
  message: React.ReactNode;
  messageId: string;
  onDismiss?: () => void;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ message, messageId, onDismiss }) => {
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

  const handleDismiss = async () => {
    if (!user) {
      // If no user is logged in, just hide the banner without saving preference
      setIsVisible(false);
      if (onDismiss) onDismiss();
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
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error("Error dismissing message:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4 relative">
      <div className="text-blue-500 mt-1">
        <InfoIcon />
      </div>
      <div className="flex-1">
        <p className="text-blue-800">{message}</p>
      </div>
      <button 
        onClick={handleDismiss} 
        className="text-blue-400 hover:text-blue-600 transition-colors absolute top-2 right-2"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default InfoBanner;
