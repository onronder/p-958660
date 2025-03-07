
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
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  
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
    errorType,
    errorDetails,
    resetForm,
    handleTestConnection,
    handleSubmit,
    setSelectedCredential,
    selectedCredential,
    isEditMode
  } = useShopifyConnection(onSuccess);

  // Auto-open help guide only on first open and not in edit mode
  useEffect(() => {
    if (open && isFirstOpen && !isEditMode) {
      setShowHelpGuide(true);
      setIsFirstOpen(false);
    }
  }, [open, isFirstOpen, isEditMode]);

  useEffect(() => {
    // Check if we should open the modal automatically from redirect
    if (location.state?.openShopifyModal) {
      onOpenChange(true);
    }
  }, [location, onOpenChange]);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
          setSelectedCredential(null);
        }
        onOpenChange(isOpen);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Shopify Store" : "Add Shopify Store"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update your Shopify store connection details."
                : "Connect to your Shopify store using Private App credentials."}
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
              disabled={isEditMode}
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
              errorType={errorType}
              errorDetails={errorDetails}
            />

            <ShopifyModalActions
              isTesting={isTesting}
              isSubmitting={isSubmitting}
              onTestConnection={handleTestConnection}
              isEditMode={isEditMode}
            />
          </form>
        </DialogContent>
      </Dialog>

      {/* Help guide with button to dismiss */}
      <ShopifyHelpGuide
        open={showHelpGuide}
        onOpenChange={setShowHelpGuide}
        autoOpen={false}
      />
    </>
  );
};

export default ShopifyPrivateAppModal;
