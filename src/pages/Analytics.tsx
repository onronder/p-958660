
import React from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsInfoBanner from "@/components/analytics/AnalyticsInfoBanner";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import EtlAnalysisChart from "@/components/analytics/EtlAnalysisChart";
import FrequencySuccessCharts from "@/components/analytics/FrequencySuccessCharts";
import DataSizeGrowthChart from "@/components/analytics/DataSizeGrowthChart";
import AnalyticsLoadingSkeleton from "@/components/analytics/AnalyticsLoadingSkeleton";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const { 
    analyticsData,
    etlData, 
    pullFrequencyData, 
    uploadSuccessData,
    dataSizeData,
    isLoading, 
    isError, 
    refetch 
  } = useAnalyticsData();
  
  const { toast } = useToast();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing analytics data",
      description: "Your analytics data is being updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <AnalyticsInfoBanner />
        <AnalyticsLoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <AnalyticsInfoBanner />
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

  const hasData = analyticsData && 
                  (analyticsData.data_pull_frequency.length > 0 || 
                   analyticsData.upload_success_rate.length > 0 ||
                   analyticsData.data_size.length > 0);

  return (
    <div className="space-y-8">
      <AnalyticsInfoBanner />
      <AnalyticsHeader onRefresh={handleRefresh} />

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EtlAnalysisChart etlData={etlData} />
          <FrequencySuccessCharts 
            pullFrequencyData={pullFrequencyData} 
            uploadSuccessData={uploadSuccessData} 
          />
          <DataSizeGrowthChart dataSizeData={dataSizeData} />
        </div>
      ) : (
        <AnalyticsLoadingSkeleton />
      )}

      {analyticsData && analyticsData.last_updated && (
        <div className="text-xs text-right text-gray-500">
          Last updated: {new Date(analyticsData.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default Analytics;
