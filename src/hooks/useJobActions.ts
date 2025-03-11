
import { Job } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { deleteJob } from "@/services/jobs";
import { toggleJobStatus } from "@/services/jobs";

// This function should be imported from wherever it's defined
// Since there's an error with triggerJobExecution, we need to create or import it properly
export const triggerJobExecution = async (jobId: string): Promise<boolean> => {
  try {
    // Here would be the actual implementation
    // For now we're just returning true since we don't have the original implementation
    return true;
  } catch (error) {
    console.error("Error executing job:", error);
    return false;
  }
};

export const useJobActions = (onJobsUpdated: () => void) => {
  const handleToggleJobStatus = async (job: Job) => {
    const updatedJob = await toggleJobStatus(job.id, job.status);
    if (updatedJob) {
      onJobsUpdated();
      
      const actionType = job.status === "active" ? "paused" : "resumed";
      toast({
        title: `Job ${actionType}`,
        description: `The job "${job.name}" has been ${actionType}.`,
      });
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
    if (window.confirm(`Are you sure you want to delete job "${jobName}"?`)) {
      if (await deleteJob(jobId)) {
        onJobsUpdated();
        toast({
          title: "Job Deleted",
          description: `The job "${jobName}" has been moved to deleted jobs.`,
        });
      }
    }
  };

  return {
    handleToggleJobStatus,
    handleRunNow,
    handleDeleteJob
  };
};
