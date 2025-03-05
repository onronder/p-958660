
import { useState } from "react";
import { Job } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { triggerJobExecution, toggleJobStatus, deleteJob } from "@/services/jobSchedulerService";
import LoadingState from "./LoadingState";
import EmptyJobsState from "./EmptyJobsState";
import JobsTable from "./JobsTable";

interface JobsListProps {
  jobs: Job[];
  isLoading: boolean;
  onJobsUpdated: () => void;
  openCreateDialog: () => void;
  sourcesExist: boolean;
}

const JobsList = ({ 
  jobs, 
  isLoading, 
  onJobsUpdated, 
  openCreateDialog, 
  sourcesExist 
}: JobsListProps) => {
  
  const handleToggleJobStatus = async (job: Job) => {
    const updatedJob = await toggleJobStatus(job.id, job.status);
    if (updatedJob) {
      onJobsUpdated();
    }
  };

  const handleRunNow = async (job: Job) => {
    toast({
      title: "Job Started",
      description: `Running job "${job.name}" now...`,
    });
    
    const success = await triggerJobExecution(job.id);
    
    if (success) {
      onJobsUpdated();
    }
  };

  const handleDeleteJob = async (jobId: string, jobName: string) => {
    if (await deleteJob(jobId)) {
      onJobsUpdated();
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyJobsState 
        sourcesExist={sourcesExist} 
        openCreateDialog={openCreateDialog} 
      />
    );
  }

  return (
    <JobsTable 
      jobs={jobs}
      onToggleJobStatus={handleToggleJobStatus}
      onRunNow={handleRunNow}
      onDeleteJob={handleDeleteJob}
    />
  );
};

export default JobsList;
