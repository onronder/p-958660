
import { useState } from "react";
import { useShopifyConnectionTest } from "./shopify/useShopifyConnectionTest";
import { useShopifySubmit } from "./shopify/useShopifySubmit";

export const useShopifyConnection = (onSuccess: () => void) => {
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiToken, setApiToken] = useState("");
  
  const { 
    isTesting, 
    testStatus, 
    testResponseData, 
    resetTestState, 
    testConnection 
  } = useShopifyConnectionTest();
  
  const { 
    isSubmitting, 
    submitCredentials 
  } = useShopifySubmit(onSuccess);

  const resetForm = () => {
    setStoreName("");
    setApiKey("");
    setApiToken("");
    resetTestState();
  };

  const handleTestConnection = async () => {
    await testConnection(storeName, apiKey, apiToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };
};
