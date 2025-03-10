
import { Job, JobFrequency, JobStatus, JobRun } from "@/types/job";

// Export types that might be specific to the job service
export type JobCreateData = Omit<Job, "id" | "created_at" | "updated_at" | "user_id" | "last_run">;

// Add a helper function to validate job status
export const validateJobStatus = (status: any): JobStatus => {
  const validStatuses: JobStatus[] = ["active", "paused", "completed", "failed"];
  
  if (typeof status === 'string' && validStatuses.includes(status.toLowerCase() as JobStatus)) {
    return status.toLowerCase() as JobStatus;
  }
  
  return "active";
};
