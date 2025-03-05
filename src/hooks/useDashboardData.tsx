
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Job } from "@/components/RecentJobsTable";

export type DashboardData = {
  metrics: {
    totalDataProcessed: number;
    totalApiCalls: number;
    activeConnections: number;
    lastUpdated: string | null;
  };
  jobSummary: {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    lastUpdated: string | null;
  };
  recentJobs: Job[];
};

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = async (): Promise<DashboardData> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found");
    }

    // Call the edge function with auth token
    const { data, error } = await supabase.functions.invoke("get-dashboard-metrics", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }

    return data as DashboardData;
  };

  const { 
    data, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["dashboardData", user?.id],
    queryFn: fetchDashboardData,
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Show error toast if there's an error
  if (error) {
    console.error("Dashboard data error:", error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data. Please try again.",
      variant: "destructive",
    });
  }

  return {
    dashboardData: data || {
      metrics: {
        totalDataProcessed: 0,
        totalApiCalls: 0,
        activeConnections: 0,
        lastUpdated: null,
      },
      jobSummary: {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        lastUpdated: null,
      },
      recentJobs: [],
    },
    isLoading,
    isError: !!error,
    refetch
  };
};
