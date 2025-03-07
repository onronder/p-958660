
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useDismissibleHelp() {
  const [isResetting, setIsResetting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetAllDismissedMessages = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You need to be logged in to reset help messages",
        variant: "destructive",
      });
      return false;
    }

    setIsResetting(true);
    try {
      const { data, error } = await supabase.rpc(
        "reset_dismissed_help_messages", 
        { p_user_id: user.id }
      );

      if (error) {
        console.error("Error resetting dismissed messages:", error);
        toast({
          title: "Error",
          description: "Failed to reset help messages",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "All help messages have been restored",
      });
      return true;
    } catch (error) {
      console.error("Error resetting dismissed messages:", error);
      toast({
        title: "Error",
        description: "Failed to reset help messages",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetAllDismissedMessages,
    isResetting,
  };
}
