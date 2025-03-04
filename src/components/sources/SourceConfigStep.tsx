
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SourceType } from "./SourceTypeCard";
import ShopifyConfigForm from "./ShopifyConfigForm";
import WooCommerceConfigForm from "./WooCommerceConfigForm";

interface SourceConfigStepProps {
  selectedSource: SourceType;
  isSubmitting: boolean;
  sourceName: string;
  setSourceName: (value: string) => void;
  storeUrl: string;
  setStoreUrl: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  apiSecret: string;
  setApiSecret: (value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SourceConfigStep: React.FC<SourceConfigStepProps> = ({
  selectedSource,
  isSubmitting,
  sourceName,
  setSourceName,
  storeUrl,
  setStoreUrl,
  apiKey,
  setApiKey,
  apiSecret,
  setApiSecret,
  onBack,
  onSubmit
}) => {
  const renderConfigForm = () => {
    switch (selectedSource) {
      case "Shopify":
        return (
          <ShopifyConfigForm
            sourceName={sourceName}
            setSourceName={setSourceName}
            storeUrl={storeUrl}
            setStoreUrl={setStoreUrl}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
        );
      case "WooCommerce":
        return (
          <WooCommerceConfigForm
            sourceName={sourceName}
            setSourceName={setSourceName}
            storeUrl={storeUrl}
            setStoreUrl={setStoreUrl}
            apiKey={apiKey}
            setApiKey={setApiKey}
            apiSecret={apiSecret}
            setApiSecret={setApiSecret}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Configure {selectedSource}</h1>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sources
        </Button>
      </div>
      
      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>
              Enter the required information to connect to your {selectedSource} account.
            </CardDescription>
          </CardHeader>
          
          <CardContent>{renderConfigForm()}</CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Source
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SourceConfigStep;
