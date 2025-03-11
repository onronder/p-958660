
export type JobFrequency = "Once" | "Hourly" | "Daily" | "Weekly" | "Monthly";
export type JobStatus = "active" | "paused" | "completed" | "failed" | "pending";

export interface Job {
  id: string;
  name: string;
  description?: string | null;
  source_id: string;
  source_name: string;
  transformation_id?: string | null;
  destination_id?: string | null;
  frequency: JobFrequency;
  schedule: string;
  last_run?: string;
  next_run?: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_deleted: boolean;
  deletion_marked_at?: string | null;
}

export interface JobRun {
  id: string;
  job_id: string;
  status: "Running" | "Success" | "Failed";
  started_at: string;
  completed_at?: string;
  rows_processed?: number;
  error_message?: string;
  user_id: string;
}
