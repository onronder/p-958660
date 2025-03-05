
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

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, isError, refetch } = useDashboardData();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <DashboardInfoBanner />
        <DashboardLoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
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

  const hasJobs = dashboardData.recentJobs && dashboardData.recentJobs.length > 0;
  const hasMetrics = dashboardData.metrics.totalDataProcessed > 0 || 
                      dashboardData.metrics.totalApiCalls > 0 || 
                      dashboardData.metrics.activeConnections > 0;

  if (!hasJobs && !hasMetrics) {
    return (
      <div className="space-y-8">
        <DashboardInfoBanner />
        <DashboardHeader onRefresh={handleRefresh} />
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

  return (
    <div className="space-y-8">
      <DashboardInfoBanner />
      <DashboardHeader onRefresh={handleRefresh} />
      <DashboardMetrics 
        totalDataProcessed={dashboardData.metrics.totalDataProcessed}
        totalApiCalls={dashboardData.metrics.totalApiCalls}
        activeConnections={dashboardData.metrics.activeConnections}
      />
      <JobsSummary 
        totalJobs={dashboardData.jobSummary.totalJobs}
        successfulJobs={dashboardData.jobSummary.successfulJobs}
        failedJobs={dashboardData.jobSummary.failedJobs}
        recentJobs={dashboardData.recentJobs}
      />
      <LastUpdated timestamp={dashboardData.metrics.lastUpdated} />
    </div>
  );
};

export default Dashboard;
