
/**
 * Log level definitions
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Generic object for log details
 */
export interface LogDetails {
  [key: string]: any;
}

/**
 * Structure of a log entry
 */
export interface DevLogEntry {
  log_level: LogLevel;
  source: string;
  message: string;
  details?: LogDetails;
  user_id?: string;
  route?: string;
  stack_trace?: string;
  request_data?: any;
  response_data?: any;
  timestamp?: string;
}

/**
 * Structure of persisted log in database
 */
export interface PersistedLog extends DevLogEntry {
  id: string;
  timestamp: string;
}

/**
 * Options for logging API calls
 */
export interface ApiCallLogOptions {
  source: string;
  endpoint: string;
  method: string;
  requestData?: any;
  responseData?: any;
  error?: any;
  duration?: number;
}
