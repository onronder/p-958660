
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
    };
    last_connection_status?: boolean;
    last_connection_time?: string;
  };
}

const ShopifyCredentialDetails: React.FC<ShopifyCredentialDetailsProps> = ({ source }) => {
  const { credentials } = source;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">API Token</h3>
          <p className="font-mono text-sm">
            {credentials?.api_token ? "●●●●●●●●●●●●●●●●" : "Not provided"}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Connection Status</h3>
          <ShopifyConnectionStatusBadge 
            lastConnectionStatus={source.last_connection_status || null} 
          />
        </div>
        
        {(credentials?.api_key || credentials?.api_secret) && (
          <>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">API Key</h3>
              <p className="font-mono text-sm">
                {credentials?.api_key ? "●●●●●●●●●●●●●●●●" : "Not provided"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">API Secret</h3>
              <p className="font-mono text-sm">
                {credentials?.api_secret ? "●●●●●●●●●●●●●●●●" : "Not provided"}
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="pt-4 border-t">
        <ShopifySchemaCacheStatus sourceId={source.id} />
      </div>
    </div>
  );
};

export default ShopifyCredentialDetails;
