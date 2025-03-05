
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type ETLData = {
  name: string;
  value: number;
}

export type ChartData = {
  time?: string;
  month?: string;
  value: number;
}

export type AnalyticsData = {
  id: string;
  user_id: string;
  etl_extraction: number;
  etl_transformation: number;
  etl_loading: number;
  data_pull_frequency: ChartData[];
  upload_success_rate: ChartData[];
  data_size: ChartData[];
  last_updated: string;
  created_at: string;
};

export const useAnalyticsData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found");
    }

    // Call the edge function with auth token
    const { data, error } = await supabase.functions.invoke("get-analytics-data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error("Error fetching analytics data:", error);
      throw new Error("Failed to fetch analytics data");
    }

    return data as AnalyticsData;
  };

  const { 
    data, 
    isLoading,
    error
  } = useQuery({
    queryKey: ["analyticsData", user?.id],
    queryFn: fetchAnalyticsData,
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  // Show error toast if there's an error
  if (error) {
    console.error("Analytics data error:", error);
    toast({
      title: "Error",
      description: "Failed to load analytics data. Please try again.",
      variant: "destructive",
    });
  }

  // Process ETL data for pie chart
  const getEtlData = (): ETLData[] => {
    if (!data) return [
      { name: "Extract", value: 40 },
      { name: "Transform", value: 30 },
      { name: "Load", value: 30 }
    ];

    return [
      { name: "Extract", value: data.etl_extraction },
      { name: "Transform", value: data.etl_transformation },
      { name: "Load", value: data.etl_loading }
    ];
  };

  return {
    analyticsData: data,
    etlData: getEtlData(),
    pullFrequencyData: data?.data_pull_frequency || [],
    uploadSuccessData: data?.upload_success_rate || [],
    dataSizeData: data?.data_size || [],
    isLoading,
    isError: !!error
  };
};
