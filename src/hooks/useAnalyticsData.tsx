
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

// Default data to use when analytics data is unavailable
const defaultAnalyticsData = {
  id: "",
  user_id: "",
  etl_extraction: 33,
  etl_transformation: 33,
  etl_loading: 34,
  data_pull_frequency: [],
  upload_success_rate: [],
  data_size: [],
  last_updated: "",
  created_at: ""
};

export const useAnalyticsData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    if (!user) {
      console.log("User not authenticated, returning default analytics data");
      return { ...defaultAnalyticsData };
    }

    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        return { ...defaultAnalyticsData };
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

      // Validate and provide defaults for missing properties
      return {
        id: data?.id || "",
        user_id: data?.user_id || "",
        etl_extraction: data?.etl_extraction ?? 33,
        etl_transformation: data?.etl_transformation ?? 33,
        etl_loading: data?.etl_loading ?? 34,
        data_pull_frequency: Array.isArray(data?.data_pull_frequency) ? data.data_pull_frequency : [],
        upload_success_rate: Array.isArray(data?.upload_success_rate) ? data.upload_success_rate : [],
        data_size: Array.isArray(data?.data_size) ? data.data_size : [],
        last_updated: data?.last_updated || "",
        created_at: data?.created_at || ""
      };
    } catch (error) {
      console.error("Analytics data fetch error:", error);
      return { ...defaultAnalyticsData };
    }
  };

  const { 
    data, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["analyticsData", user?.id],
    queryFn: fetchAnalyticsData,
    enabled: !!user,
    retry: 1, // Limit retries to avoid infinite loading state
  });

  // Process ETL data for pie chart with safety checks
  const getEtlData = (): ETLData[] => {
    if (!data) return [
      { name: "Extract", value: 33 },
      { name: "Transform", value: 33 },
      { name: "Load", value: 34 }
    ];

    return [
      { name: "Extract", value: data.etl_extraction ?? 33 },
      { name: "Transform", value: data.etl_transformation ?? 33 },
      { name: "Load", value: data.etl_loading ?? 34 }
    ];
  };

  // Show error toast if there's an error
  if (error) {
    console.error("Analytics data error:", error);
    toast({
      title: "Error",
      description: "Failed to load analytics data. Please try again.",
      variant: "destructive",
    });
  }

  return {
    analyticsData: data || { ...defaultAnalyticsData },
    etlData: getEtlData(),
    pullFrequencyData: data?.data_pull_frequency || [],
    uploadSuccessData: data?.upload_success_rate || [],
    dataSizeData: data?.data_size || [],
    isLoading,
    isError: !!error,
    refetch
  };
};
