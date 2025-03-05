
import { useState } from "react";
import { useSettingsBase, Webhook } from "./useSettingsBase";

export function useWebhooks() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  // Fetch webhooks
  const fetchWebhooks = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { webhooks } = await invokeSettingsFunction("get_webhooks");
      setWebhooks(webhooks);
      return webhooks;
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create webhook
  const createWebhook = async (name: string, endpointUrl: string, eventType: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { webhook } = await invokeSettingsFunction("create_webhook", {
        name,
        endpoint_url: endpointUrl,
        event_type: eventType
      });
      
      // Add the new webhook to the state
      setWebhooks(prev => [webhook, ...prev]);
      
      toast({
        title: "Webhook Created",
        description: "Your new webhook has been created successfully.",
      });
      
      return webhook;
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update webhook
  const updateWebhook = async (
    webhookId: string,
    name: string,
    endpointUrl: string,
    eventType: string,
    active: boolean
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { webhook } = await invokeSettingsFunction("update_webhook", {
        webhookId,
        name,
        endpoint_url: endpointUrl,
        event_type: eventType,
        active
      });
      
      // Update the webhook in the state
      setWebhooks(prev => 
        prev.map(wh => wh.id === webhookId ? webhook : wh)
      );
      
      toast({
        title: "Webhook Updated",
        description: "The webhook has been updated successfully.",
      });
      
      return webhook;
    } catch (error) {
      console.error("Error updating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete webhook
  const deleteWebhook = async (webhookId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { success } = await invokeSettingsFunction("delete_webhook", {
        webhookId
      });
      
      // Remove the webhook from state
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
      
      toast({
        title: "Webhook Deleted",
        description: "The webhook has been deleted successfully.",
      });
      
      return success;
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    webhooks,
    isLoading,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook
  };
}
