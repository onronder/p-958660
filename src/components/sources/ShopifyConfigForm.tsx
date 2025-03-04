
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShopifyConfigFormProps {
  sourceName: string;
  setSourceName: (value: string) => void;
  storeUrl: string;
  setStoreUrl: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
}

const ShopifyConfigForm: React.FC<ShopifyConfigFormProps> = ({
  sourceName,
  setSourceName,
  storeUrl,
  setStoreUrl,
  apiKey,
  setApiKey
}) => {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="sourceName">Source Name</Label>
        <Input
          id="sourceName"
          placeholder="My Shopify Store"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="storeUrl">Store URL</Label>
        <Input
          id="storeUrl"
          placeholder="mystore.myshopify.com"
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          The full URL of your Shopify store
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiKey">Admin API Access Token</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="shpat_..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Found in your Shopify Admin under Apps &gt; Develop apps &gt; Create an app
        </p>
      </div>
    </div>
  );
};

export default ShopifyConfigForm;
