
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ShopifyCredential {
  id: string;
  store_name: string;
  api_key: string;
  api_token: string;
  last_connection_status: boolean | null;
  last_connection_time: string | null;
  created_at: string;
}

export const useShopifyCredentials = () => {
  const [credentials, setCredentials] = useState<ShopifyCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<ShopifyCredential | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadCredentials = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("shopify_credentials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching Shopify credentials:", error);
        toast({
          title: "Error",
          description: "Failed to load Shopify credentials",
          variant: "destructive",
        });
        return;
      }
      
      setCredentials(data || []);
    } catch (error) {
      console.error("Error in loading credentials:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user]);

  return {
    credentials,
    isLoading,
    loadCredentials,
    selectedCredential,
    setSelectedCredential
  };
};
