
import { Job, JobFrequency, JobStatus, JobRun } from "@/types/job";

// Export types that might be specific to the job service
export type JobCreateData = Omit<Job, "id" | "created_at" | "updated_at" | "user_id" | "last_run">;

// Add a helper function to validate job status
export const validateJobStatus = (status: any): JobStatus => {
  // Define valid statuses based on the database constraint
  const validStatuses: JobStatus[] = ["active", "paused", "completed", "failed", "pending"];
  
  // First check if it's a valid string
  if (typeof status === 'string') {
    // Convert to lowercase for case-insensitive matching
    const normalizedStatus = status.toLowerCase();
    
    // Check if the normalized status is in our valid list
    if (validStatuses.includes(normalizedStatus as JobStatus)) {
      return normalizedStatus as JobStatus;
    }
  }
  
  // Default to "active" if status is invalid or not provided
  return "active";
};
