
import { useState, useCallback } from "react";
import { ShopifyCredential } from "../types/shopifyTypes";

export const useShopifyCredentialSelection = (credentials: ShopifyCredential[]) => {
  const [selectedCredential, setSelectedCredential] = useState<ShopifyCredential | null>(null);

  // Select a credential by ID
  const selectCredentialById = useCallback((credentialId: string) => {
    const credential = credentials.find(cred => cred.id === credentialId);
    setSelectedCredential(credential || null);
    return credential;
  }, [credentials]);

  return {
    selectedCredential,
    setSelectedCredential,
    selectCredentialById
  };
};
