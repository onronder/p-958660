
// Type definition for a destination
export interface Destination {
  id: string;
  name: string;
  destination_type: string;
  storage_type: string;
  status: "Active" | "Pending" | "Failed";
  export_format: string;
  schedule: string;
  last_export: string | null;
  config: Record<string, any>;
}
