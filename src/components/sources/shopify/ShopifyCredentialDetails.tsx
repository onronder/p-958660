
import React from "react";
import CredentialsSection from "./credential-display/CredentialsSection";
import SchemaCacheSection from "./credential-display/SchemaCacheSection";

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
  
  return (
    <div className="space-y-6">
      <CredentialsSection 
        credentials={credentials} 
        sourceLastConnectionStatus={source.last_connection_status}
      />
      
      <SchemaCacheSection sourceId={source.id} />
    </div>
  );
};

export default ShopifyCredentialDetails;
