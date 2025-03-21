
export interface ShopifyCredential {
  id: string;
  store_name: string;
  client_id: string;
  client_secret: string;
  access_token: string;
  last_connection_status: boolean | null;
  last_connection_time: string | null;
  created_at: string;
}
