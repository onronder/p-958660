
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
  result_data: any[]; // Explicitly typed as array to prevent type errors
  record_count?: number;
  exported_at?: string;
  export_format?: string;
  destination_type?: string;
  export_details?: any;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deletion_marked_at?: string;
  next_run?: string;
  last_run?: string;
  schedule?: string;
}

export interface PredefinedDatasetTemplate {
  id: string;
  name: string;
  description: string;
  template_key: string;
  query_structure: {
    query: string;
    defaultParams: Record<string, any>;
    dataPath: string;
  };
  source_type: string;
  created_at: string;
  updated_at: string;
}

export interface UserDataset {
  id: string;
  user_id: string;
  source_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  dataset_type: 'predefined' | 'dependent' | 'custom';
  query_params: Record<string, any> | null;
  result_data: any[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message: string | null;
  record_count: number | null;
  last_updated: string;
  created_at: string;
  is_deleted?: boolean;
}
