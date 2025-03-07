import { useState, useEffect } from "react";
import { useShopifyConnectionTest } from "./shopify/useShopifyConnectionTest";
import { useShopifySubmit } from "./shopify/useShopifySubmit";
import { useShopifyFormState } from "./shopify/useShopifyFormState";
import { ShopifyCredential } from "./types/shopifyTypes";

export type { ShopifyCredential } from "./types/shopifyTypes";

export const useShopifyConnection = (onSuccess: () => void) => {
  const {
    storeName,
    setStoreName,
    apiKey,
    setApiKey,
    apiToken,
    setApiToken,
    selectedCredential,
    setSelectedCredential,
    isEditMode,
    setIsEditMode,
    resetForm: resetFormState
  } = useShopifyFormState();
  
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

  const resetForm = () => {
    resetFormState();
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
