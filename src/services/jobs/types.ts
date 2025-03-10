
import { Job, JobFrequency, JobStatus, JobRun } from "@/types/job";

// Export types that might be specific to the job service
export type JobCreateData = Omit<Job, "id" | "created_at" | "updated_at" | "user_id" | "last_run">;
