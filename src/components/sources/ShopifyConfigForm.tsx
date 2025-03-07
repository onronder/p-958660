
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";

interface ShopifyConfigFormProps {
  sourceName: string;
  setSourceName: (value: string) => void;
  storeUrl: string;
  setStoreUrl: (value: string) => void;
  onComplete?: () => void;
}

const ShopifyConfigForm: React.FC<ShopifyConfigFormProps> = ({
  sourceName,
  setSourceName,
  storeUrl,
  setStoreUrl,
  onComplete
}) => {
  // This form is not used anymore since we're using the ShopifyPrivateAppModal instead
  // This is just a placeholder to fix build errors
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sourceName">Integration Name</Label>
        <Input
          id="sourceName"
          placeholder="My Shopify Store"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="storeUrl">Shopify Store URL</Label>
        <Input
          id="storeUrl"
          placeholder="yourstore.myshopify.com"
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Enter your Shopify store URL (e.g., yourstore.myshopify.com)
        </p>
      </div>
      
      <div className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Please use the Private App setup instead. This component is deprecated.
        </p>
      </div>
    </div>
  );
};

export default ShopifyConfigForm;
