
import { useState } from "react";
import { Job } from "@/types/job";
import LoadingState from "./LoadingState";
import EmptyJobsState from "./EmptyJobsState";
import JobsTable from "./JobsTable";
import { useJobActions } from "@/hooks/useJobActions";

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
  
  const { 
    handleToggleJobStatus, 
    handleRunNow, 
    handleDeleteJob 
  } = useJobActions(onJobsUpdated);

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
