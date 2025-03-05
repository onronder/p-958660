
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

// Default empty data structure to use when data is unavailable
const defaultDashboardData: DashboardData = {
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
};

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = async (): Promise<DashboardData> => {
    if (!user) {
      console.log("User not authenticated, returning default data");
      return { ...defaultDashboardData };
    }

    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        return { ...defaultDashboardData };
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

      // Validate returned data and provide defaults for any missing properties
      return {
        metrics: {
          totalDataProcessed: data?.metrics?.totalDataProcessed ?? 0,
          totalApiCalls: data?.metrics?.totalApiCalls ?? 0,
          activeConnections: data?.metrics?.activeConnections ?? 0,
          lastUpdated: data?.metrics?.lastUpdated || null,
        },
        jobSummary: {
          totalJobs: data?.jobSummary?.totalJobs ?? 0,
          successfulJobs: data?.jobSummary?.successfulJobs ?? 0,
          failedJobs: data?.jobSummary?.failedJobs ?? 0,
          lastUpdated: data?.jobSummary?.lastUpdated || null,
        },
        recentJobs: Array.isArray(data?.recentJobs) ? data.recentJobs : [],
      };
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      return { ...defaultDashboardData };
    }
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
    retry: 1, // Limit retries to avoid infinite loading state
    // Removed the refetchInterval for on-demand updates only
  });

  // Show error toast if there's an error, but don't crash the app
  if (error) {
    console.error("Dashboard data error:", error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data. Please try again.",
      variant: "destructive",
    });
  }

  return {
    dashboardData: data || { ...defaultDashboardData },
    isLoading,
    isError: !!error,
    refetch
  };
};
