
import React from "react";
import ShopifyConnectionStatusBadge from "./ShopifyConnectionStatusBadge";
import ShopifySchemaCacheStatus from "./ShopifySchemaCacheStatus";

interface ShopifyCredentialDetailsProps {
  source: {
    id: string;
    name: string;
    url: string;
    credentials: {
      api_token?: string;
      api_key?: string;
      api_secret?: string;
      store_domain?: string;
      // Support new credential format
      client_id?: string;
      client_secret?: string;
      access_token?: string;
      last_connection_status?: boolean;
      last_connection_time?: string;
    };
    last_connection_status?: boolean;
    last_connection_time?: string;
  };
}

const ShopifyCredentialDetails: React.FC<ShopifyCredentialDetailsProps> = ({ source }) => {
  const { credentials } = source;
  
  // Determine which credentials to display based on what's available
  const hasNewCredentials = credentials?.client_id || credentials?.client_secret || credentials?.access_token;
  const hasLegacyCredentials = credentials?.api_token || credentials?.api_key || credentials?.api_secret;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Show API Token / Access Token */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {credentials?.access_token ? "Access Token" : "API Token"}
          </h3>
          <p className="font-mono text-sm">
            {credentials?.access_token || credentials?.api_token ? "●●●●●●●●●●●●●●●●" : "Not provided"}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Connection Status</h3>
          <ShopifyConnectionStatusBadge 
            lastConnectionStatus={credentials?.last_connection_status || source.last_connection_status || null} 
          />
        </div>
        
        {/* Show API Key / Client ID */}
        {(credentials?.api_key || credentials?.client_id) && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {credentials?.client_id ? "Client ID" : "API Key"}
            </h3>
            <p className="font-mono text-sm">
              {credentials?.client_id || credentials?.api_key ? "●●●●●●●●●●●●●●●●" : "Not provided"}
            </p>
          </div>
        )}
        
        {/* Show API Secret / Client Secret */}
        {(credentials?.api_secret || credentials?.client_secret) && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {credentials?.client_secret ? "Client Secret" : "API Secret"}
            </h3>
            <p className="font-mono text-sm">
              {credentials?.client_secret || credentials?.api_secret ? "●●●●●●●●●●●●●●●●" : "Not provided"}
            </p>
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t">
        <ShopifySchemaCacheStatus sourceId={source.id} />
      </div>
    </div>
  );
};

export default ShopifyCredentialDetails;
