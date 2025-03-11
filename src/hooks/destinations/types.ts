
export interface Destination {
  id: string;
  name: string;
  destination_type: string;
  storage_type: string;
  status: "Active" | "Pending" | "Failed" | "Deleted";
  export_format: string;
  schedule: string;
  last_export: string | null;
  config?: Record<string, any>;
  credentials?: Record<string, any>;
  is_deleted?: boolean;
  deletion_marked_at?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  save_to_storage?: boolean;
}
