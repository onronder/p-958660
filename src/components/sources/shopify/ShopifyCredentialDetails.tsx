
import React from "react";
import { formatDate } from "@/services/sourcesService";

interface ShopifyCredentialDetailsProps {
  lastConnectionTime: string | null;
  createdAt: string;
}

const ShopifyCredentialDetails: React.FC<ShopifyCredentialDetailsProps> = ({
  lastConnectionTime,
  createdAt
}) => {
  return (
    <div className="space-y-2.5 mt-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Type:</span>
        <span className="font-medium">Shopify Private App</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Last Tested:</span>
        <span className="font-medium">
          {lastConnectionTime ? formatDate(lastConnectionTime) : "Never"}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Added:</span>
        <span className="font-medium">{formatDate(createdAt)}</span>
      </div>
    </div>
  );
};

export default ShopifyCredentialDetails;
