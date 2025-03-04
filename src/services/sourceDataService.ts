
import { SourceType } from "@/components/sources/SourceTypeCard";
import { SourceStatus } from "@/types/source";
import { supabase } from "@/integrations/supabase/client";

export const sourceOptions = [
  {
    id: "Shopify" as SourceType,
    title: "Shopify",
    description: "Connect to your Shopify store to import products, orders, and customer data",
    availableStatus: "available" as const,
  },
  {
    id: "WooCommerce" as SourceType,
    title: "WooCommerce",
    description: "Import data from your WordPress WooCommerce store",
    availableStatus: "available" as const,
  },
  {
    id: "Custom API" as SourceType,
    title: "Custom API",
    description: "Connect to a custom RESTful API endpoint",
    availableStatus: "coming-soon" as const,
  },
  {
    id: "Google Sheets" as SourceType,
    title: "Google Sheets",
    description: "Import data from Google Sheets spreadsheets",
    availableStatus: "coming-soon" as const,
  },
];

export const addSource = async (
  userId: string,
  sourceName: string,
  storeUrl: string,
  sourceType: SourceType,
  credentials: any
) => {
  const { data, error } = await supabase
    .from('sources')
    .insert({
      user_id: userId,
      name: sourceName,
      url: storeUrl,
      source_type: sourceType,
      status: 'Pending' as SourceStatus,
      credentials
    })
    .select();
  
  if (error) {
    console.error("Error adding source:", error);
    throw error;
  }
  
  return data;
};
