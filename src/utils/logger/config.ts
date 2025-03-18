
/**
 * Configuration options for the DevLogger
 */
export interface DevLoggerConfig {
  enabled: boolean;
  persistLogs: boolean;
  logToConsole: boolean;
  redactSensitiveFields: boolean;
  sensitiveFields: string[];
  maxConsoleLogSize: number;
}

// Default configuration
export const DEFAULT_CONFIG: DevLoggerConfig = {
  enabled: true,
  persistLogs: true,
  logToConsole: true,
  redactSensitiveFields: true,
  sensitiveFields: ['password', 'token', 'secret', 'api_key', 'apiKey', 'api_token', 'apiToken'],
  maxConsoleLogSize: 10000,
};
