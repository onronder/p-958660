
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShopifyFormField from "./shopify/ShopifyFormField";
import ShopifyConnectionStatus from "./shopify/ShopifyConnectionStatus";
import ShopifyModalActions from "./shopify/ShopifyModalActions";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import ShopifyHelpGuide from "./shopify/ShopifyHelpGuide";

interface ShopifyPrivateAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ShopifyPrivateAppModal: React.FC<ShopifyPrivateAppModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const location = useLocation();
  const [showHelpOnOpen, setShowHelpOnOpen] = useState(false);
  const {
    storeName,
    setStoreName,
    apiKey,
    setApiKey,
    apiToken,
    setApiToken,
    isSubmitting,
    isTesting,
    testStatus,
    testResponseData,
    resetForm,
    handleTestConnection,
    handleSubmit,
  } = useShopifyConnection(onSuccess);

  // Auto-open help guide on first open
  useEffect(() => {
    if (open && !showHelpOnOpen) {
      // Only show automatically on first open
      setShowHelpOnOpen(true);
    }
  }, [open]);

  useEffect(() => {
    // Check if we should open the modal automatically from redirect
    if (location.state?.openShopifyModal) {
      onOpenChange(true);
    }
  }, [location, onOpenChange]);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shopify Store</DialogTitle>
            <DialogDescription>
              Connect to your Shopify store using Private App credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <ShopifyFormField
              id="storeName"
              label="Store URL"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="mystore.myshopify.com"
              tooltip="Enter your Shopify store URL (e.g., mystore.myshopify.com)"
            />

            <ShopifyFormField
              id="apiKey"
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
              tooltip="The API Key from your Shopify Private App"
            />

            <ShopifyFormField
              id="apiToken"
              label="Admin API Access Token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Admin API Access Token"
              type="password"
              tooltip="The Admin API Access Token from your Shopify Private App"
            />

            <ShopifyConnectionStatus
              status={testStatus}
              shopData={testResponseData}
              storeName={storeName}
            />

            <ShopifyModalActions
              isTesting={isTesting}
              isSubmitting={isSubmitting}
              onTestConnection={handleTestConnection}
            />
          </form>
        </DialogContent>
      </Dialog>

      {/* Help guide that automatically opens on first modal open */}
      <ShopifyHelpGuide
        open={showHelpOnOpen}
        onOpenChange={setShowHelpOnOpen}
        autoOpen={open}
      />
    </>
  );
};

export default ShopifyPrivateAppModal;
