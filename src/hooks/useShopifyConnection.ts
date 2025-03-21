
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
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    accessToken,
    setAccessToken,
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
    errorType,
    errorDetails,
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
    await testConnection(storeName, clientId, clientSecret, accessToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && selectedCredential) {
      // Update existing credentials
      const success = await updateCredentials(
        selectedCredential.id,
        clientId, 
        clientSecret, 
        accessToken, 
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
        clientId, 
        clientSecret, 
        accessToken, 
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
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    accessToken,
    setAccessToken,
    isSubmitting,
    isTesting,
    testStatus,
    testResponseData,
    errorType,
    errorDetails,
    resetForm,
    handleTestConnection,
    handleSubmit,
    selectedCredential,
    setSelectedCredential,
    isEditMode
  };
};
