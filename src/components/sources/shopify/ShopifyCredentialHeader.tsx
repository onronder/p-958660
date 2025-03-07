
import React from "react";
import { ShoppingBag } from "lucide-react";
import ShopifyConnectionStatusBadge from "./ShopifyConnectionStatusBadge";

interface ShopifyCredentialHeaderProps {
  storeName: string;
  lastConnectionStatus: boolean | null;
}

const ShopifyCredentialHeader: React.FC<ShopifyCredentialHeaderProps> = ({
  storeName,
  lastConnectionStatus
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{storeName}</h3>
        <ShopifyConnectionStatusBadge lastConnectionStatus={lastConnectionStatus} />
      </div>
    </div>
  );
};

export default ShopifyCredentialHeader;
