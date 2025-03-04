
export type SourceStatus = "Active" | "Inactive" | "Pending" | "Failed";

export interface Source {
  id: string;
  name: string;
  url: string;
  source_type: string;
  status: SourceStatus;
  last_sync?: string;
  credentials?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
