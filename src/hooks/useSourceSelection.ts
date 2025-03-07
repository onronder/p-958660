
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useSourceSelection = (onSelectShopify: () => void) => {
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const { toast } = useToast();

  const handleSourceSelection = (sourceType: string) => {
    setShowSourceSelector(false);
    
    // Handle source type selection
    if (sourceType === "shopify") {
      onSelectShopify();
    } else if (sourceType === "woocommerce") {
      toast({
        title: "Coming Soon",
        description: "WooCommerce integration is coming soon.",
      });
    } else if (sourceType === "api") {
      toast({
        title: "Coming Soon",
        description: "Custom API integration is coming soon.",
      });
    } else if (sourceType === "googlesheets") {
      toast({
        title: "Coming Soon",
        description: "Google Sheets integration is coming soon.",
      });
    }
  };

  return {
    showSourceSelector,
    setShowSourceSelector,
    handleSourceSelection
  };
};
