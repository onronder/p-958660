
import React from "react";
import { Card } from "@/components/ui/card";
import { ShopifyCredential } from "@/hooks/types/shopifyTypes";
import { useShopifyConnectionTesting } from "@/hooks/shopify/useShopifyConnectionTesting";
import { useShopifyDeletion } from "@/hooks/shopify/useShopifyDeletion";
import { mapCredentialToSource } from "./shopify/utils/shopifySourceMapper";
import ShopifyCredentialHeader from "./shopify/ShopifyCredentialHeader";
import ShopifyCredentialDetails from "./shopify/ShopifyCredentialDetails";
import ShopifyCredentialActions from "./shopify/ShopifyCredentialActions";
import ShopifyDeleteDialog from "./shopify/ShopifyDeleteDialog";

interface ShopifyCredentialCardProps {
  credential: ShopifyCredential;
  onRefresh: () => void;
  onEdit: (credential: ShopifyCredential) => void;
}

const ShopifyCredentialCard: React.FC<ShopifyCredentialCardProps> = ({
  credential,
  onRefresh,
  onEdit,
}) => {
  // Use our custom hooks for testing and deletion
  const { isTesting, testConnection } = useShopifyConnectionTesting(credential, onRefresh);
  const { 
    isDeleting, 
    showDeleteDialog, 
    openDeleteDialog, 
    closeDeleteDialog, 
    handleDelete 
  } = useShopifyDeletion(credential.id, onRefresh);

  // Convert credential to source format for components that expect it
  const shopifySource = mapCredentialToSource(credential);

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow duration-200">
        <div className="space-y-4">
          <ShopifyCredentialHeader 
            storeName={credential.store_name}
            lastConnectionStatus={credential.last_connection_status}
          />
          
          <ShopifyCredentialDetails source={shopifySource} />
        </div>
        
        <ShopifyCredentialActions
          isTesting={isTesting}
          isDeleting={isDeleting}
          onTestConnection={testConnection}
          onEdit={() => onEdit(credential)}
          onDelete={openDeleteDialog}
        />
      </Card>

      <ShopifyDeleteDialog
        open={showDeleteDialog}
        onOpenChange={closeDeleteDialog}
        storeName={credential.store_name}
        onConfirmDelete={handleDelete}
      />
    </>
  );
};

export default ShopifyCredentialCard;
