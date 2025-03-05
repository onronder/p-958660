
import React from "react";
import { Card } from "@/components/ui/card";
import RecentJobsTable from "@/components/RecentJobsTable";
import { Job } from "@/components/RecentJobsTable";

interface JobsSummaryProps {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  recentJobs: Job[];
}

const JobsSummary: React.FC<JobsSummaryProps> = ({ 
  totalJobs = 0, 
  successfulJobs = 0, 
  failedJobs = 0, 
  recentJobs = [] 
}) => {
  // Ensure recentJobs is always an array
  const safeJobs = Array.isArray(recentJobs) ? recentJobs : [];
  const hasJobs = safeJobs.length > 0;

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Jobs</h3>
          <div className="text-sm text-muted-foreground">
            {totalJobs} Total Jobs • {successfulJobs} Successful • {failedJobs} Failed
          </div>
        </div>
        {hasJobs ? (
          <RecentJobsTable jobs={safeJobs} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No jobs have been run yet. Jobs will appear here when you start processing data.
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobsSummary;
