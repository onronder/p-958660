
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useShopifyDeletion = (credentialId: string, onRefresh: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Use soft deletion by marking the source as deleted
      const { error } = await supabase
        .from("sources")
        .update({ 
          is_deleted: true,
          deletion_marked_at: new Date().toISOString(),
          status: 'Deleted'
        })
        .eq("id", credentialId);

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

  const openDeleteDialog = () => setShowDeleteDialog(true);
  const closeDeleteDialog = () => setShowDeleteDialog(false);

  return {
    isDeleting,
    showDeleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete
  };
};
