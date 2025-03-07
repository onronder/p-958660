
import { useState, useEffect } from "react";
import { ShopifyCredential } from "../types/shopifyTypes";

export const useShopifyFormState = () => {
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [selectedCredential, setSelectedCredential] = useState<ShopifyCredential | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Set form values when an existing credential is selected for editing
  useEffect(() => {
    if (selectedCredential) {
      setStoreName(selectedCredential.store_name);
      setApiKey(selectedCredential.api_key);
      setApiToken(selectedCredential.api_token);
      setIsEditMode(true);
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
  };

  return {
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
    resetForm
  };
};
