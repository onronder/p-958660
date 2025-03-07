
import { useState, useEffect } from "react";
import { useShopifyConnectionTest } from "./shopify/useShopifyConnectionTest";
import { useShopifySubmit } from "./shopify/useShopifySubmit";

export interface ShopifyCredential {
  id: string;
  store_name: string;
  api_key: string;
  api_token: string;
  last_connection_status: boolean | null;
  last_connection_time: string | null;
  created_at: string;
}

export const useShopifyConnection = (onSuccess: () => void) => {
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [selectedCredential, setSelectedCredential] = useState<ShopifyCredential | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { 
    isTesting, 
    testStatus, 
    testResponseData, 
    resetTestState, 
    testConnection 
  } = useShopifyConnectionTest();
  
  const { 
    isSubmitting, 
    submitCredentials,
    updateCredentials 
  } = useShopifySubmit(onSuccess);

  // Set form values when an existing credential is selected for editing
  useEffect(() => {
    if (selectedCredential) {
      setStoreName(selectedCredential.store_name);
      setApiKey(selectedCredential.api_key);
      setApiToken(selectedCredential.api_token);
      setIsEditMode(true);
      
      // Set test status if connection was previously tested
      if (selectedCredential.last_connection_status) {
        // You could set a placeholder test status here if needed
      }
    } else {
      setIsEditMode(false);
    }
  }, [selectedCredential]);

  const resetForm = () => {
    setStoreName("");
    setApiKey("");
    setApiToken("");
    setSelectedCredential(null);
    setIsEditMode(false);
    resetTestState();
  };

  const handleTestConnection = async () => {
    await testConnection(storeName, apiKey, apiToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && selectedCredential) {
      // Update existing credentials
      const success = await updateCredentials(
        selectedCredential.id,
        apiKey, 
        apiToken, 
        testResponseData, 
        testStatus === "success"
      );
      
      if (success) {
        resetForm();
      }
    } else {
      // Create new credentials
      const success = await submitCredentials(
        storeName, 
        apiKey, 
        apiToken, 
        testResponseData, 
        testStatus === "success"
      );
      
      if (success) {
        resetForm();
      }
    }
  };

  return {
    storeName,
    setStoreName,
    apiKey,
    setApiKey,
    apiToken,
    setApiToken,
    isSubmitting,
    isTesting,
    testStatus,
    testResponseData,
    resetForm,
    handleTestConnection,
    handleSubmit,
    selectedCredential,
    setSelectedCredential,
    isEditMode
  };
};
