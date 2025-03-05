
import { useState } from "react";
import { useSettingsBase, ApiKey } from "./useSettingsBase";

export function useApiKeys() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { apiKeys } = await invokeSettingsFunction("get_api_keys");
      setApiKeys(apiKeys);
      return apiKeys;
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create API key
  const createApiKey = async (name: string, expiresAt?: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const data = await invokeSettingsFunction("create_api_key", {
        name,
        expires_at: expiresAt
      });
      
      // Add the new key to the state
      setApiKeys(prev => [data.apiKey, ...prev]);
      
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
      
      return { ...data.apiKey, key: data.key };
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { success } = await invokeSettingsFunction("delete_api_key", {
        keyId
      });
      
      // Remove the key from state
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
      
      return success;
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKeys,
    isLoading,
    fetchApiKeys,
    createApiKey,
    deleteApiKey
  };
}
