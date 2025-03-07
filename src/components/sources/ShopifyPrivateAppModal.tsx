
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation } from "react-router-dom";

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
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testResponseData, setTestResponseData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Check if we should open the modal automatically from redirect
    if (location.state?.openShopifyModal) {
      onOpenChange(true);
    }
  }, [location, onOpenChange]);

  const resetForm = () => {
    setStoreName("");
    setApiKey("");
    setApiToken("");
    setIsSubmitting(false);
    setIsTesting(false);
    setTestStatus("idle");
    setTestResponseData(null);
  };

  const handleTestConnection = async () => {
    if (!storeName || !apiToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTesting(true);
      setTestStatus("idle");
      setTestResponseData(null);

      const formattedStoreUrl = storeName.includes(".myshopify.com")
        ? storeName
        : `${storeName}.myshopify.com`;

      console.log("Testing connection to:", formattedStoreUrl);

      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: formattedStoreUrl,
          api_key: apiKey,
          api_token: apiToken,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        setTestStatus("error");
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to test connection",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        console.error("Connection test failed:", data.error);
        setTestStatus("error");
        toast({
          title: "Connection Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // Connection successful - save test response data
      setTestResponseData(data.shop);
      setTestStatus("success");
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${formattedStoreUrl}`,
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestStatus("error");
      toast({
        title: "Connection Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a source",
        variant: "destructive",
      });
      return;
    }

    if (!storeName || !apiKey || !apiToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format store URL if needed
      const formattedStoreUrl = storeName.includes(".myshopify.com")
        ? storeName
        : `${storeName}.myshopify.com`;

      // If we haven't tested the connection yet, do it now
      if (testStatus !== "success") {
        const { data, error } = await supabase.functions.invoke("shopify-private", {
          body: {
            action: "test_connection",
            store_url: formattedStoreUrl,
            api_key: apiKey,
            api_token: apiToken,
          },
        });

        if (error || data.error) {
          console.error("Connection test failed:", error || data.error);
          toast({
            title: "Connection Failed",
            description: "Please test your connection before saving",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // If test was successful but testResponseData is empty, store the shop data
        if (!testResponseData && data.shop) {
          setTestResponseData(data.shop);
        }
      }

      // Prepare store data to save
      const shopName = testResponseData?.name || formattedStoreUrl;

      // Insert credentials into database
      const { data: insertedData, error: insertError } = await supabase
        .from("shopify_credentials")
        .insert({
          user_id: user.id,
          store_name: formattedStoreUrl,
          api_key: apiKey,
          api_token: apiToken,
          last_connection_status: true,
          last_connection_time: new Date().toISOString(),
        })
        .select('id');

      if (insertError) {
        console.error("Error inserting credentials:", insertError);
        toast({
          title: "Error",
          description: insertError.message || "Failed to save credentials",
          variant: "destructive",
        });
        return;
      }

      // Log the inserted record ID to confirm it was saved
      console.log("Saved credentials with ID:", insertedData[0]?.id);

      toast({
        title: "Success",
        description: "Shopify credentials saved successfully",
      });

      // Reset form and close modal
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="storeName">Store URL</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="max-w-[250px] bg-white text-foreground border border-input shadow-md"
                  >
                    <p>Enter your Shopify store URL (e.g., mystore.myshopify.com)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="mystore.myshopify.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">API Key</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="max-w-[250px] bg-white text-foreground border border-input shadow-md"
                  >
                    <p>The API Key from your Shopify Private App</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiToken">Admin API Access Token</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="max-w-[250px] bg-white text-foreground border border-input shadow-md"
                  >
                    <p>The Admin API Access Token from your Shopify Private App</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Admin API Access Token"
            />
          </div>

          {testStatus === "error" && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Connection test failed. Please check your credentials.
            </div>
          )}

          {testStatus === "success" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-green-500 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Connection successful!
              </div>
              {testResponseData && (
                <div className="text-xs text-muted-foreground mt-1">
                  Connected to store: {testResponseData.name || storeName}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShopifyPrivateAppModal;
