
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WooCommerceConfigFormProps {
  sourceName: string;
  setSourceName: (value: string) => void;
  storeUrl: string;
  setStoreUrl: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  apiSecret: string;
  setApiSecret: (value: string) => void;
}

const WooCommerceConfigForm: React.FC<WooCommerceConfigFormProps> = ({
  sourceName,
  setSourceName,
  storeUrl,
  setStoreUrl,
  apiKey,
  setApiKey,
  apiSecret,
  setApiSecret
}) => {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="sourceName">Source Name</Label>
        <Input
          id="sourceName"
          placeholder="My WooCommerce Store"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="storeUrl">Store URL</Label>
        <Input
          id="storeUrl"
          placeholder="https://example.com"
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiKey">Consumer Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="ck_..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiSecret">Consumer Secret</Label>
        <Input
          id="apiSecret"
          type="password"
          placeholder="cs_..."
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Found in WooCommerce &gt; Settings &gt; Advanced &gt; REST API
        </p>
      </div>
    </div>
  );
};

export default WooCommerceConfigForm;
