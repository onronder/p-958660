
export interface Dataset {
  id: string;
  user_id: string;
  source_id: string;
  name: string;
  extraction_type: "predefined" | "dependent" | "custom";
  template_name?: string;
  custom_query?: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  status_message?: string;
  started_at?: string;
  completed_at?: string;
  result_data?: any[];
  record_count?: number;
  exported_at?: string;
  export_format?: string;
  destination_type?: string;
  export_details?: any;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  deletion_marked_at?: string;
}
