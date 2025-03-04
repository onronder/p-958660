
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type DashboardMetric = {
  id: string;
  metric_name: string;
  metric_value: number;
  last_updated: string;
};

export type JobSummary = {
  id: string;
  total_jobs: number;
  successful_jobs: number;
  failed_jobs: number;
  last_updated: string;
};

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
};

const fetchDashboardMetrics = async () => {
  const { data, error } = await supabase
    .from("dashboard_metrics")
    .select("*");

  if (error) {
    throw new Error(`Error fetching metrics: ${error.message}`);
  }

  return data as DashboardMetric[];
};

const fetchJobSummary = async () => {
  const { data, error } = await supabase
    .from("job_summary")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching job summary: ${error.message}`);
  }

  return data as JobSummary;
};

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
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
  });

  const { 
    data: metricsData, 
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ["dashboardMetrics", user?.id],
    queryFn: fetchDashboardMetrics,
    enabled: !!user,
  });

  const {
    data: jobData,
    isLoading: isLoadingJobs,
    error: jobError
  } = useQuery({
    queryKey: ["jobSummary", user?.id],
    queryFn: fetchJobSummary,
    enabled: !!user,
  });

  useEffect(() => {
    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    }

    if (jobError) {
      console.error("Error fetching job summary:", jobError);
      toast({
        title: "Error",
        description: "Failed to load job summary",
        variant: "destructive",
      });
    }
  }, [metricsError, jobError, toast]);

  useEffect(() => {
    if (metricsData) {
      // Process metrics data
      const processedMetrics = {
        totalDataProcessed: 0,
        totalApiCalls: 0,
        activeConnections: 0,
        lastUpdated: null as string | null,
      };

      metricsData.forEach((metric) => {
        switch (metric.metric_name) {
          case "total_data_processed":
            processedMetrics.totalDataProcessed = metric.metric_value;
            processedMetrics.lastUpdated = metric.last_updated;
            break;
          case "total_api_calls":
            processedMetrics.totalApiCalls = metric.metric_value;
            break;
          case "active_connections":
            processedMetrics.activeConnections = metric.metric_value;
            break;
        }
      });

      setDashboardData((prev) => ({
        ...prev,
        metrics: processedMetrics,
      }));
    }
  }, [metricsData]);

  useEffect(() => {
    if (jobData) {
      // Process job summary data
      setDashboardData((prev) => ({
        ...prev,
        jobSummary: {
          totalJobs: jobData.total_jobs,
          successfulJobs: jobData.successful_jobs,
          failedJobs: jobData.failed_jobs,
          lastUpdated: jobData.last_updated,
        },
      }));
    }
  }, [jobData]);

  return {
    dashboardData,
    isLoading: isLoadingMetrics || isLoadingJobs,
    isError: !!metricsError || !!jobError,
  };
};
