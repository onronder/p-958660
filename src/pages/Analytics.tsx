
import React from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import EmptyStateCard from "@/components/EmptyStateCard";
import { ChartPie } from "lucide-react";

// Import the new components
import AnalyticsInfoBanner from "@/components/analytics/AnalyticsInfoBanner";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import EtlAnalysisChart from "@/components/analytics/EtlAnalysisChart";
import FrequencySuccessCharts from "@/components/analytics/FrequencySuccessCharts";
import DataSizeGrowthChart from "@/components/analytics/DataSizeGrowthChart";

const Analytics: React.FC = () => {
  const { 
    etlData, 
    pullFrequencyData, 
    uploadSuccessData, 
    dataSizeData, 
    analyticsData,
    isLoading, 
    isError,
    refetch 
  } = useAnalyticsData();

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
              There was an error loading the analytics data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasAnalyticsData = analyticsData && (
    pullFrequencyData.length > 0 || 
    uploadSuccessData.length > 0 || 
    dataSizeData.length > 0
  );

  if (!hasAnalyticsData) {
    return (
      <div className="space-y-8">
        <AnalyticsInfoBanner />
        <AnalyticsHeader onRefresh={handleRefresh} />
        <EmptyStateCard 
          icon={ChartPie}
          title="No Analytics Data Available"
          description="Analytics data will appear here once you have processed data through the system. Connect a data source and run jobs to see analytics."
          actionLabel="Go to Sources"
          onAction={() => window.location.href = '/sources'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnalyticsInfoBanner />
      <AnalyticsHeader onRefresh={handleRefresh} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EtlAnalysisChart etlData={etlData} />
        <FrequencySuccessCharts 
          pullFrequencyData={pullFrequencyData} 
          uploadSuccessData={uploadSuccessData} 
        />
        <DataSizeGrowthChart dataSizeData={dataSizeData} />
      </div>
    </div>
  );
};

export default Analytics;
