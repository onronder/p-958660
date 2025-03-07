
import { useShopifyCredentialsList } from "./shopify/useShopifyCredentialsList";
import { useShopifyCredentialSelection } from "./shopify/useShopifyCredentialSelection";
import { useShopifyCredentialOperations } from "./shopify/useShopifyCredentialOperations";

export type { ShopifyCredential } from "./types/shopifyTypes";

export const useShopifyCredentials = () => {
  const { credentials, isLoading, error, loadCredentials } = useShopifyCredentialsList();
  
  const { 
    selectedCredential, 
    setSelectedCredential, 
    selectCredentialById 
  } = useShopifyCredentialSelection(credentials);
  
  const { 
    deleteCredential, 
    updateConnectionStatus 
  } = useShopifyCredentialOperations(loadCredentials, selectedCredential);

  return {
    // From useShopifyCredentialsList
    credentials,
    isLoading,
    error,
    loadCredentials,
    
    // From useShopifyCredentialSelection
    selectedCredential,
    setSelectedCredential,
    selectCredentialById,
    
    // From useShopifyCredentialOperations
    deleteCredential,
    updateConnectionStatus
  };
};
