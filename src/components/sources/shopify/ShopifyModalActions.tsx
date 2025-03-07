
import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ShopifyModalActionsProps {
  isTesting: boolean;
  isSubmitting: boolean;
  onTestConnection: () => void;
}

const ShopifyModalActions: React.FC<ShopifyModalActionsProps> = ({
  isTesting,
  isSubmitting,
  onTestConnection,
}) => {
  return (
    <DialogFooter className="sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onTestConnection}
        disabled={isTesting || isSubmitting}
      >
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          "Test Connection"
        )}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Credentials"
        )}
      </Button>
    </DialogFooter>
  );
};

export default ShopifyModalActions;
