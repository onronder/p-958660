
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Trash2 } from "lucide-react";

interface ShopifyCredentialActionsProps {
  isTesting: boolean;
  isDeleting: boolean;
  onTestConnection: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ShopifyCredentialActions: React.FC<ShopifyCredentialActionsProps> = ({
  isTesting,
  isDeleting,
  onTestConnection,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex justify-between mt-6 pt-4 border-t border-border">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onTestConnection}
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
      <div className="flex gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
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
  );
};

export default ShopifyCredentialActions;
