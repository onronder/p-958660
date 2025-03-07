
import React from "react";
import { AlertCircle } from "lucide-react";

interface ShopifyConnectionStatusProps {
  status: "idle" | "success" | "error";
  errorMessage?: string;
  shopData?: {
    name?: string;
  };
  storeName?: string;
}

const ShopifyConnectionStatus: React.FC<ShopifyConnectionStatusProps> = ({
  status,
  errorMessage,
  shopData,
  storeName,
}) => {
  if (status === "idle") {
    return null;
  }

  if (status === "error") {
    return (
      <div className="flex items-center text-red-500 text-sm">
        <AlertCircle className="h-4 w-4 mr-2" />
        {errorMessage || "Connection test failed. Please check your credentials."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center text-green-500 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Connection successful!
      </div>
      {shopData && (
        <div className="text-xs text-muted-foreground mt-1">
          Connected to store: {shopData.name || storeName}
        </div>
      )}
    </div>
  );
};

export default ShopifyConnectionStatus;
