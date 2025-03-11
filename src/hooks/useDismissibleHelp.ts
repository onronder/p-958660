
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useDismissibleHelp = () => {
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  /**
   * Check if a specific help message is dismissed
   */
  const isMessageDismissed = (messageId: string) => {
    return dismissedMessages.includes(messageId);
  };

  /**
   * Dismiss a specific help message
   */
  const dismissMessage = async (messageId: string) => {
    try {
      // Update local state immediately for UI responsiveness
      setDismissedMessages(prev => [...prev, messageId]);
      
      // Call Supabase function to persist the dismissal
      const { data, error } = await supabase.rpc('dismiss_help_message', {
        message_id: messageId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error dismissing help message:', error);
      // Revert local state on error
      setDismissedMessages(prev => prev.filter(id => id !== messageId));
      
      toast({
        title: 'Error',
        description: 'Failed to dismiss help message. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  /**
   * Reset all dismissed help messages
   */
  const resetAllDismissedMessages = async () => {
    try {
      setIsResetting(true);
      
      const { data, error } = await supabase.rpc('reset_dismissed_help_messages', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      if (error) throw error;
      
      // Clear local state
      setDismissedMessages([]);
      
      toast({
        title: 'Help messages reset',
        description: 'All help messages will now be shown again.',
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting help messages:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to reset help messages. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    dismissedMessages,
    isMessageDismissed,
    dismissMessage,
    resetAllDismissedMessages,
    isResetting
  };
};
