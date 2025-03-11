
import React from "react";
import { CheckCircle, ShoppingBag, XCircle } from "lucide-react";

interface ShopifyCredentialHeaderProps {
  storeName: string;
  lastConnectionStatus: boolean | null;
}

const ShopifyCredentialHeader: React.FC<ShopifyCredentialHeaderProps> = ({
  storeName,
  lastConnectionStatus
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{storeName}</h3>
      </div>
      
      {lastConnectionStatus !== null && (
        <div className="flex items-center gap-1.5">
          {lastConnectionStatus ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Failed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopifyCredentialHeader;
