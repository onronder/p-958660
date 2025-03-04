
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Clock, Database, Upload } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import RecentJobsTable, { Job } from "@/components/RecentJobsTable";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, isLoading, isError } = useDashboardData();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  // Sample job data - in a real application, this would come from the API
  useEffect(() => {
    // Mock data for recent jobs
    const mockJobs: Job[] = [
      {
        source: "Orders",
        startDate: "2023-11-22",
        duration: "00:15:30",
        rowsProcessed: 10345,
        status: "Success",
      },
      {
        source: "Products",
        startDate: "2023-11-22",
        duration: "00:10:15",
        rowsProcessed: 3345,
        status: "Success",
      },
      {
        source: "Customers",
        startDate: "2023-11-21",
        duration: "00:12:45",
        rowsProcessed: 1234,
        status: "Failed",
      },
    ];
    setRecentJobs(mockJobs);
  }, []);

  const statsData = [
    {
      title: "Service Uptime",
      value: "99.8%",
      description: "Last 24 hours",
      icon: PieChart,
      iconColor: "text-green-500",
    },
    {
      title: "New Data Rows",
      value: dashboardData.metrics.totalDataProcessed.toFixed(1) + "GB",
      description: "Data processed",
      icon: Database,
      iconColor: "text-blue-500",
    },
    {
      title: "API Calls",
      value: dashboardData.metrics.totalApiCalls.toLocaleString(),
      description: "Last 30 days",
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
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
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

      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

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
          <RecentJobsTable jobs={recentJobs} />
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
