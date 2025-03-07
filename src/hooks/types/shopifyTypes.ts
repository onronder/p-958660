
export interface ShopifyCredential {
  id: string;
  store_name: string;
  api_key: string;
  api_token: string;
  last_connection_status: boolean | null;
  last_connection_time: string | null;
  created_at: string;
}
