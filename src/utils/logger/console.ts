
import { DevLogEntry } from './types';
import { truncateForConsole } from './utils';
import { DevLoggerConfig, DEFAULT_CONFIG } from './config';

/**
 * Handles console output for logs
 */
export class ConsoleAdapter {
  private config: DevLoggerConfig = DEFAULT_CONFIG;
  
  /**
   * Update the configuration
   */
  setConfig(config: Partial<DevLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Log a message to the console
   */
  logToConsole(entry: DevLogEntry): void {
    if (!this.config.logToConsole) return;
    
    const prefix = `[${entry.log_level.toUpperCase()}] [${entry.source}]`;
    const details = entry.details ? 
      truncateForConsole(entry.details, this.config.maxConsoleLogSize) : '';
    const stackTrace = entry.stack_trace ? 
      truncateForConsole(entry.stack_trace, this.config.maxConsoleLogSize) : '';
    
    switch (entry.log_level) {
      case 'debug':
        console.debug(prefix, entry.message, details);
        break;
      case 'info':
        console.info(prefix, entry.message, details);
        break;
      case 'warn':
        console.warn(prefix, entry.message, details);
        break;
      case 'error':
      case 'critical':
        console.error(prefix, entry.message, details, stackTrace);
        break;
    }
  }
}

// Export a singleton instance
export const consoleAdapter = new ConsoleAdapter();
