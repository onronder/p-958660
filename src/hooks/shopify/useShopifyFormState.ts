
import { useState, useEffect } from "react";
import { ShopifyCredential } from "../types/shopifyTypes";

export const useShopifyFormState = () => {
  const [storeName, setStoreName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [selectedCredential, setSelectedCredential] = useState<ShopifyCredential | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Set form values when an existing credential is selected for editing
  useEffect(() => {
    if (selectedCredential) {
      setStoreName(selectedCredential.store_name);
      setClientId(selectedCredential.client_id);
      setClientSecret(selectedCredential.client_secret);
      setAccessToken(selectedCredential.access_token);
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [selectedCredential]);

  const resetForm = () => {
    setStoreName("");
    setClientId("");
    setClientSecret("");
    setAccessToken("");
    setSelectedCredential(null);
    setIsEditMode(false);
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
    selectedCredential,
    setSelectedCredential,
    isEditMode,
    setIsEditMode,
    resetForm
  };
};
