
import React from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsInfoBanner from "@/components/analytics/AnalyticsInfoBanner";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import EtlAnalysisChart from "@/components/analytics/EtlAnalysisChart";
import FrequencySuccessCharts from "@/components/analytics/FrequencySuccessCharts";
import DataSizeGrowthChart from "@/components/analytics/DataSizeGrowthChart";
import AnalyticsLoadingSkeleton from "@/components/analytics/AnalyticsLoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

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

  // Render fallback UI if something goes wrong
  if (isError) {
    return (
      <div className="space-y-8">
        <AnalyticsInfoBanner />
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">We're having trouble loading your analytics</h3>
            <p className="text-muted-foreground mb-4">
              Our system encountered an error while trying to load your analytics data. 
              This is usually a temporary issue.
            </p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <AnalyticsInfoBanner />
        <AnalyticsLoadingSkeleton />
      </div>
    );
  }

  // Make sure we have analytics data before rendering
  const safeAnalyticsData = analyticsData || {};
  const hasData = safeAnalyticsData && 
                  (Array.isArray(pullFrequencyData) && pullFrequencyData.length > 0 || 
                   Array.isArray(uploadSuccessData) && uploadSuccessData.length > 0 ||
                   Array.isArray(dataSizeData) && dataSizeData.length > 0);

  return (
    <div className="space-y-8">
      <AnalyticsInfoBanner />
      <AnalyticsHeader onRefresh={handleRefresh} />

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EtlAnalysisChart etlData={etlData || []} />
          <FrequencySuccessCharts 
            pullFrequencyData={Array.isArray(pullFrequencyData) ? pullFrequencyData : []} 
            uploadSuccessData={Array.isArray(uploadSuccessData) ? uploadSuccessData : []} 
          />
          <DataSizeGrowthChart dataSizeData={Array.isArray(dataSizeData) ? dataSizeData : []} />
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-xl font-medium mb-2">No analytics data available yet</h3>
            <p className="text-muted-foreground mb-4">
              Your analytics data will appear here once you start processing data through the system.
              Try running some jobs or connecting data sources to see analytics.
            </p>
          </div>
        </Card>
      )}

      {safeAnalyticsData && safeAnalyticsData.last_updated && (
        <div className="text-xs text-right text-gray-500">
          Last updated: {new Date(safeAnalyticsData.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default Analytics;
