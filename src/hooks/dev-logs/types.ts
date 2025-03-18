
export interface DevLog {
  id: string;
  timestamp: string;
  log_level: string;
  source: string;
  message: string;
  details?: any;
  user_id?: string;
  route?: string;
  stack_trace?: string;
  request_data?: any;
  response_data?: any;
}

export interface LogFilters {
  log_level?: string;
  source?: string;
  user_id?: string;
  route?: string;
  search?: string;
}
