import { Card } from "@/components/ui/card";
import { PieChart, Clock, Database, Upload, BarChart3, RefreshCw } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import RecentJobsTable from "@/components/RecentJobsTable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import EmptyStateCard from "@/components/EmptyStateCard";

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, isError, refetch } = useDashboardData();

  // Format the timestamp into a more readable format
  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Not available";
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
        <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
          <div className="text-blue-500 mt-1">
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
            <p className="text-blue-800">
              <span className="font-bold">⚡ The Dashboard</span> provides a centralized view of your data integration processes, offering key performance metrics, recent activity, and insights to help you monitor and manage your workflows effectively.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

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

  const statsData = [
    {
      title: "Service Uptime",
      value: "99.8%",
      description: "Last 24 hours",
      icon: PieChart,
      iconColor: "text-green-500",
    },
    {
      title: "Data Processed",
      value: `${dashboardData.metrics.totalDataProcessed.toFixed(1)} GB`,
      description: "Total processed",
      icon: Database,
      iconColor: "text-blue-500",
    },
    {
      title: "API Calls",
      value: dashboardData.metrics.totalApiCalls.toLocaleString(),
      description: "Total calls",
      icon: Clock,
      iconColor: "text-yellow-500",
    },
    {
      title: "Active Connections",
      value: dashboardData.metrics.activeConnections,
      description: "Current connections",
      icon: Upload,
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
        <div className="text-blue-500 mt-1">
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
          <p className="text-blue-800">
            <span className="font-bold">⚡ The Dashboard</span> provides a centralized view of your data integration processes, offering key performance metrics, recent activity, and insights to help you monitor and manage your workflows effectively.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <DashboardMetricCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recent Jobs</h3>
            <div className="text-sm text-muted-foreground">
              {dashboardData.jobSummary.totalJobs} Total Jobs • {dashboardData.jobSummary.successfulJobs} Successful • {dashboardData.jobSummary.failedJobs} Failed
            </div>
          </div>
          {hasJobs ? (
            <RecentJobsTable jobs={dashboardData.recentJobs} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No jobs have been run yet. Jobs will appear here when you start processing data.
            </div>
          )}
        </div>
      </Card>

      {dashboardData.metrics.lastUpdated && (
        <div className="text-xs text-right text-gray-500">
          Last updated: {formatLastUpdated(dashboardData.metrics.lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
