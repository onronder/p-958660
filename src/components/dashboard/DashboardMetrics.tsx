
import React from "react";
import { PieChart, Clock, Database, Upload } from "lucide-react";
import DashboardMetricCard from "@/components/DashboardMetricCard";

interface DashboardMetricsProps {
  totalDataProcessed: number;
  totalApiCalls: number;
  activeConnections: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  totalDataProcessed = 0, 
  totalApiCalls = 0, 
  activeConnections = 0 
}) => {
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
      value: `${(totalDataProcessed || 0).toFixed(1)} GB`,
      description: "Total processed",
      icon: Database,
      iconColor: "text-blue-500",
    },
    {
      title: "API Calls",
      value: (totalApiCalls || 0).toLocaleString(),
      description: "Total calls",
      icon: Clock,
      iconColor: "text-yellow-500",
    },
    {
      title: "Active Connections",
      value: activeConnections || 0,
      description: "Current connections",
      icon: Upload,
      iconColor: "text-purple-500",
    },
  ];

  return (
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
  );
};

export default DashboardMetrics;
