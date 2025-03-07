
import React from "react";
import { AlertCircle } from "lucide-react";

interface ShopifyConnectionStatusProps {
  status: "idle" | "success" | "error";
  errorMessage?: string;
  errorType?: string;
  errorDetails?: any;
  shopData?: {
    name?: string;
  };
  storeName?: string;
}

const ShopifyConnectionStatus: React.FC<ShopifyConnectionStatusProps> = ({
  status,
  errorMessage,
  errorType,
  errorDetails,
  shopData,
  storeName,
}) => {
  if (status === "idle") {
    return null;
  }

  if (status === "error") {
    // Get specific error message based on error type
    let displayErrorMessage = errorMessage || "Connection test failed. Please check your credentials.";
    
    if (errorType === "auth_error") {
      displayErrorMessage = "Authentication failed. The API key or token is invalid.";
    } else if (errorType === "store_not_found") {
      displayErrorMessage = "Store not found. Please check your store URL.";
    } else if (errorType === "permission_error") {
      displayErrorMessage = "Your API token doesn't have sufficient permissions.";
    } else if (errorType === "network_error") {
      displayErrorMessage = "Network error. Please check your internet connection and try again.";
    } else if (errorType === "server_error") {
      displayErrorMessage = "Shopify server error. Please try again later.";
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center text-red-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          {displayErrorMessage}
        </div>
        
        {errorDetails && errorDetails.errors && (
          <div className="text-xs text-muted-foreground mt-1 bg-red-50 p-2 rounded">
            <p className="font-semibold">Error details:</p>
            <ul className="list-disc pl-4 mt-1">
              {Object.entries(errorDetails.errors).map(([key, value]: [string, any]) => (
                <li key={key}>
                  {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
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
