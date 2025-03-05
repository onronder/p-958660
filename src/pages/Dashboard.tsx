
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { BarChart3 } from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import DashboardLoadingSkeleton from "@/components/DashboardLoadingSkeleton";
import DashboardInfoBanner from "@/components/dashboard/DashboardInfoBanner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import JobsSummary from "@/components/dashboard/JobsSummary";
import LastUpdated from "@/components/dashboard/LastUpdated";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, isError, refetch } = useDashboardData();
  const { toast } = useToast();

  // Log component rendering for debugging
  useEffect(() => {
    console.log("Dashboard rendering", { 
      user: !!user, 
      isLoading, 
      isError, 
      hasData: !!dashboardData 
    });
  }, [user, isLoading, isError, dashboardData]);

  const handleRefresh = () => {
    try {
      console.log("Refreshing dashboard data");
      refetch();
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Always render the banner and header to ensure UI consistency
  const renderHeader = () => (
    <>
      <DashboardInfoBanner />
      <DashboardHeader onRefresh={handleRefresh} />
    </>
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {renderHeader()}
        <DashboardLoadingSkeleton />
      </div>
    );
  }

  // Handle error state
  if (isError || !dashboardData) {
    return (
      <div className="space-y-8">
        {renderHeader()}
        <div className="bg-red-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
          <div className="text-red-500 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-red-800">
              There was an error loading the dashboard data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Safely check if we have jobs or metrics
  const hasJobs = Array.isArray(dashboardData.recentJobs) && dashboardData.recentJobs.length > 0;
  const hasMetrics = !!(dashboardData.metrics && (
    dashboardData.metrics.totalDataProcessed > 0 || 
    dashboardData.metrics.totalApiCalls > 0 || 
    dashboardData.metrics.activeConnections > 0
  ));

  // Show empty state if no data
  if (!hasJobs && !hasMetrics) {
    return (
      <div className="space-y-8">
        {renderHeader()}
        <EmptyStateCard 
          icon={BarChart3}
          title="No Dashboard Data Yet"
          description="Start by connecting your first data source and running jobs to see metrics and analytics on your dashboard."
          actionLabel="Connect a Data Source"
          onAction={() => window.location.href = '/sources/add'}
        />
      </div>
    );
  }

  // Render dashboard with data
  return (
    <div className="space-y-8">
      {renderHeader()}
      
      <DashboardMetrics 
        totalDataProcessed={dashboardData.metrics?.totalDataProcessed || 0}
        totalApiCalls={dashboardData.metrics?.totalApiCalls || 0}
        activeConnections={dashboardData.metrics?.activeConnections || 0}
      />
      
      <JobsSummary 
        totalJobs={dashboardData.jobSummary?.totalJobs || 0}
        successfulJobs={dashboardData.jobSummary?.successfulJobs || 0}
        failedJobs={dashboardData.jobSummary?.failedJobs || 0}
        recentJobs={Array.isArray(dashboardData.recentJobs) ? dashboardData.recentJobs : []}
      />
      
      <LastUpdated timestamp={dashboardData.metrics?.lastUpdated || null} />
    </div>
  );
};

export default Dashboard;
