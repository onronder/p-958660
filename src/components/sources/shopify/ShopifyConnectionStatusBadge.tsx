
import React from "react";
import { Check, AlertCircle } from "lucide-react";

interface ShopifyConnectionStatusBadgeProps {
  lastConnectionStatus: boolean | null;
}

const ShopifyConnectionStatusBadge: React.FC<ShopifyConnectionStatusBadgeProps> = ({
  lastConnectionStatus
}) => {
  if (lastConnectionStatus === null) {
    return (
      <div className="flex items-center text-yellow-500 text-sm">
        <AlertCircle className="h-4 w-4 mr-2" />
        Not tested
      </div>
    );
  }

  if (lastConnectionStatus) {
    return (
      <div className="flex items-center text-green-500 text-sm">
        <Check className="h-4 w-4 mr-2" />
        Connected
      </div>
    );
  }

  return (
    <div className="flex items-center text-red-500 text-sm">
      <AlertCircle className="h-4 w-4 mr-2" />
      Connection failed
    </div>
  );
};

export default ShopifyConnectionStatusBadge;
