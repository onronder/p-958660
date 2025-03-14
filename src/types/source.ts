
export type SourceStatus = "Active" | "Inactive" | "Pending" | "Failed" | "Deleted";

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
  is_deleted?: boolean;
  deletion_marked_at?: string;
}
