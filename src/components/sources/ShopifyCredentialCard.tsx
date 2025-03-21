
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ShopifyCredentialHeader from "./shopify/ShopifyCredentialHeader";
import ShopifyCredentialDetails from "./shopify/ShopifyCredentialDetails";
import ShopifyCredentialActions from "./shopify/ShopifyCredentialActions";
import ShopifyDeleteDialog from "./shopify/ShopifyDeleteDialog";

interface ShopifyCredential {
  id: string;
  store_name: string;
  client_id?: string;
  client_secret?: string;
  access_token?: string;
  api_key?: string;
  api_token?: string;
  last_connection_status: boolean | null;
  last_connection_time: string | null;
  created_at: string;
}

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
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);

      // Use whichever credentials are available (supporting both old and new formats)
      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: credential.store_name,
          api_key: credential.api_key || credential.client_id,
          api_token: credential.api_token || credential.client_secret,
          access_token: credential.access_token,
        },
      });

      if (error || data?.error) {
        console.error("Connection test failed:", error || data?.error);
        
        // Update connection status in database for sources table
        await supabase
          .from("sources")
          .update({
            credentials: {
              ...credential,
              last_connection_status: false,
              last_connection_time: new Date().toISOString(),
            },
            status: 'Failed',
            updated_at: new Date().toISOString() // Update timestamp
          })
          .eq("id", credential.id);
        
        toast({
          title: "Connection Failed",
          description: "Failed to connect to Shopify. Please check your credentials.",
          variant: "destructive",
        });
        
        onRefresh();
        return;
      }

      // Update connection status in database for sources table
      await supabase
        .from("sources")
        .update({
          credentials: {
            ...credential,
            last_connection_status: true,
            last_connection_time: new Date().toISOString(),
          },
          status: 'Active',
          updated_at: new Date().toISOString() // Update timestamp
        })
        .eq("id", credential.id);

      toast({
        title: "Connection Successful",
        description: "Successfully connected to Shopify.",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Use the deleteSource function from sourcesService instead of directly deleting
      // This properly handles soft deletion instead of permanent deletion
      const { error } = await supabase
        .from("sources")
        .update({ 
          is_deleted: true,
          deletion_marked_at: new Date().toISOString(),
          status: 'Deleted'
        })
        .eq("id", credential.id);

      if (error) {
        console.error("Error deleting source:", error);
        toast({
          title: "Error",
          description: "Failed to delete source",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Source Moved to Trash",
        description: "Shopify source has been moved to the trash",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Create a properly formatted source object from the credential
  const shopifySource = {
    id: credential.id,
    name: credential.store_name,
    url: credential.store_name,
    credentials: {
      // Include both new and legacy credential formats
      api_key: credential.api_key,
      api_token: credential.api_token,
      api_secret: credential.client_secret,
      store_domain: credential.store_name,
      // New credential format
      client_id: credential.client_id,
      client_secret: credential.client_secret,
      access_token: credential.access_token,
      last_connection_status: credential.last_connection_status,
      last_connection_time: credential.last_connection_time
    },
    last_connection_status: credential.last_connection_status,
    last_connection_time: credential.last_connection_time
  };

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
          onTestConnection={handleTestConnection}
          onEdit={() => onEdit(credential)}
          onDelete={() => setShowDeleteDialog(true)}
        />
      </Card>

      <ShopifyDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        storeName={credential.store_name}
        onConfirmDelete={handleDelete}
      />
    </>
  );
};

export default ShopifyCredentialCard;
