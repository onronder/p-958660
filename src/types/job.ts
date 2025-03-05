
export type JobFrequency = "Once" | "Hourly" | "Daily" | "Weekly" | "Monthly";
export type JobStatus = "Active" | "Paused" | "Completed" | "Failed";

export interface Job {
  id: string;
  name: string;
  description?: string;
  source_id: string;
  source_name: string;
  transformation_id?: string;
  destination_id?: string;
  frequency: JobFrequency;
  schedule: string;
  last_run?: string;
  next_run?: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
}
