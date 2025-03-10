
export interface Destination {
  id?: string;
  name: string;
  destination_type: string;
  storage_type: string;
  status: string;
  export_format: string;
  schedule: string;
  last_export?: Date | null;
  config: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface DestinationLog {
  id: string;
  destination_id: string;
  event_type: string; 
  message: string;
  details?: any;
  created_at: Date;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  error?: string | null;
}
