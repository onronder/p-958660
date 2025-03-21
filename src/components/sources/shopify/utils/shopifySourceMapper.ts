
import { ShopifyCredential } from "@/hooks/types/shopifyTypes";

export interface ShopifySource {
  id: string;
  name: string;
  url: string;
  credentials: {
    api_key?: string;
    api_token?: string;
    api_secret?: string;
    store_domain?: string;
    client_id?: string;
    client_secret?: string;
    access_token?: string;
    last_connection_status?: boolean;
    last_connection_time?: string;
  };
  last_connection_status?: boolean;
  last_connection_time?: string;
}

export const mapCredentialToSource = (credential: ShopifyCredential): ShopifySource => {
  return {
    id: credential.id,
    name: credential.store_name,
    url: credential.store_name,
    credentials: {
      // Include both new and legacy credential formats
      api_key: credential.api_key,
      api_token: credential.api_token,
      api_secret: credential.client_secret,
      store_domain: credential.store_name,
      // New credential format
      client_id: credential.client_id,
      client_secret: credential.client_secret,
      access_token: credential.access_token,
      last_connection_status: credential.last_connection_status,
      last_connection_time: credential.last_connection_time
    },
    last_connection_status: credential.last_connection_status,
    last_connection_time: credential.last_connection_time
  };
};
