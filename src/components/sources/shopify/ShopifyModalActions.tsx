
import React, { useState } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import ShopifyHelpGuide from "./ShopifyHelpGuide";

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
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  return (
    <>
      <DialogFooter className="sm:justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowHelpGuide(true)}
            className="rounded-full"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
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
        </div>
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

      <ShopifyHelpGuide
        open={showHelpGuide}
        onOpenChange={setShowHelpGuide}
      />
    </>
  );
};

export default ShopifyModalActions;
