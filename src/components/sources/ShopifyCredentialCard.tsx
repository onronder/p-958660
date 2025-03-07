
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit, Loader2, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/services/sourcesService";

interface ShopifyCredential {
  id: string;
  store_name: string;
  api_key: string;
  api_token: string;
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

      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: credential.store_name,
          api_key: credential.api_key,
          api_token: credential.api_token,
        },
      });

      if (error || data.error) {
        console.error("Connection test failed:", error || data.error);
        
        // Update connection status in database
        await supabase
          .from("shopify_credentials")
          .update({
            last_connection_status: false,
            last_connection_time: new Date().toISOString(),
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

      // Update connection status in database
      await supabase
        .from("shopify_credentials")
        .update({
          last_connection_status: true,
          last_connection_time: new Date().toISOString(),
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

      const { error } = await supabase
        .from("shopify_credentials")
        .delete()
        .eq("id", credential.id);

      if (error) {
        console.error("Error deleting credential:", error);
        toast({
          title: "Error",
          description: "Failed to delete credential",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Deleted",
        description: "Shopify credential deleted successfully",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error deleting credential:", error);
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

  const renderConnectionStatus = () => {
    if (credential.last_connection_status === null) {
      return (
        <div className="flex items-center text-yellow-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Not tested
        </div>
      );
    }

    if (credential.last_connection_status) {
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

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{credential.store_name}</h3>
                {renderConnectionStatus()}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">Shopify Private App</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Tested:</span>
                <span className="font-medium">
                  {credential.last_connection_time
                    ? formatDate(credential.last_connection_time)
                    : "Never"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Added:</span>
                <span className="font-medium">
                  {formatDate(credential.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onEdit(credential)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the Shopify credential for {credential.store_name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShopifyCredentialCard;
