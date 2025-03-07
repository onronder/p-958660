
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShopifyHelpGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoOpen?: boolean;
}

const ShopifyHelpGuide: React.FC<ShopifyHelpGuideProps> = ({
  open,
  onOpenChange,
  autoOpen = false,
}) => {
  useEffect(() => {
    if (autoOpen) {
      onOpenChange(true);
    }
  }, [autoOpen, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">First Time Shopify Connection</DialogTitle>
          <DialogDescription>
            Follow these steps to set up your Shopify API credentials
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">1. Create a Shopify Developer Account</h3>
              <p className="text-sm text-muted-foreground">
                Before you begin, you&apos;ll need a Shopify Developer account. 
              </p>
              <div className="flex">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => window.open("https://partners.shopify.com/signup", "_blank")}
                >
                  Sign up for a free account <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">2. Create a New Custom App</h3>
              <p className="text-sm text-muted-foreground">
                Create a new custom app once you have a Developer account:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground pl-2">
                <li>Log in to your Shopify Partner Dashboard using your login credentials.</li>
                <li>In the sidebar menu, click on &quot;Apps&quot;.</li>
                <li>On the &quot;Apps&quot; page, click on the &quot;Create app&quot; button.</li>
                <li>Next, select the &quot;Custom app&quot; option from the available choices.</li>
                <li>Click on the &quot;Create app&quot; button once again.</li>
                <li>Fill out all the required information for your custom app, such as the app name and app URL, in the appropriate fields.</li>
                <li>Once you have entered all the necessary information, click on the &quot;Create app&quot; button one final time to complete the process.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">3. Set up API Credentials</h3>
              <p className="text-sm text-muted-foreground">
                To interact with the Shopify API Integration or any external API, your app will need the appropriate API credentials:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground pl-2">
                <li>In your custom app&apos;s page, click on &quot;App setup.&quot;</li>
                <li>Scroll down the &quot;API keys and scopes&quot; section. <span className="text-primary font-medium">(If you do not grant read permission to API Scopes, the existing data will not be accessible even if the connection is successful.)</span></li>
                <li>Click &quot;Generate API credentials.&quot;</li>
                <li>Fill in the required information, such as API key description and scopes, and click &quot;Generate.&quot;</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm">
                Once you have your API Key and Admin API Access Token, you can enter them in the connection form to connect to your Shopify store.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShopifyHelpGuide;
