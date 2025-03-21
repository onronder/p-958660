
import React from "react";
import CredentialField from "./CredentialField";
import ShopifyConnectionStatusBadge from "../ShopifyConnectionStatusBadge";

interface CredentialsSectionProps {
  credentials: {
    api_token?: string;
    api_key?: string;
    api_secret?: string;
    store_domain?: string;
    client_id?: string;
    client_secret?: string;
    access_token?: string;
    last_connection_status?: boolean;
    last_connection_time?: string;
  };
  sourceLastConnectionStatus?: boolean | null;
}

const CredentialsSection: React.FC<CredentialsSectionProps> = ({ 
  credentials,
  sourceLastConnectionStatus
}) => {
  // Determine which credentials to display based on what's available
  const hasNewCredentials = credentials?.client_id || credentials?.client_secret || credentials?.access_token;
  const hasLegacyCredentials = credentials?.api_token || credentials?.api_key || credentials?.api_secret;
  
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Show API Token / Access Token */}
      <CredentialField 
        label={credentials?.access_token ? "Access Token" : "API Token"}
        value={credentials?.access_token || credentials?.api_token}
      />
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Connection Status</h3>
        <ShopifyConnectionStatusBadge 
          lastConnectionStatus={credentials?.last_connection_status || sourceLastConnectionStatus || null} 
        />
      </div>
      
      {/* Show API Key / Client ID */}
      {(credentials?.api_key || credentials?.client_id) && (
        <CredentialField 
          label={credentials?.client_id ? "Client ID" : "API Key"}
          value={credentials?.client_id || credentials?.api_key}
        />
      )}
      
      {/* Show API Secret / Client Secret */}
      {(credentials?.api_secret || credentials?.client_secret) && (
        <CredentialField 
          label={credentials?.client_secret ? "Client Secret" : "API Secret"}
          value={credentials?.client_secret || credentials?.api_secret}
        />
      )}
    </div>
  );
};

export default CredentialsSection;
