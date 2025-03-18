
import { DevLogEntry, LogDetails, LogLevel } from '../types';
import { serializeError } from '../utils';
import { LoggerCore } from './LoggerCore';

/**
 * Logging functions extension for LoggerCore
 */
export class LoggingFunctions extends LoggerCore {
  /**
   * Log debug level message
   */
  public debug(source: string, message: string, details?: LogDetails): void {
    this.log({ log_level: 'debug', source, message, details });
  }

  /**
   * Log info level message
   */
  public info(source: string, message: string, details?: LogDetails): void {
    this.log({ log_level: 'info', source, message, details });
  }

  /**
   * Log warning level message
   */
  public warn(source: string, message: string, details?: LogDetails): void {
    this.log({ log_level: 'warn', source, message, details });
  }

  /**
   * Log error level message
   */
  public error(source: string, message: string, error?: any, details?: LogDetails): void {
    const stack = error?.stack || new Error().stack;
    this.log({
      log_level: 'error',
      source,
      message,
      stack_trace: stack,
      details: {
        ...details,
        error: error ? serializeError(error) : undefined
      }
    });
  }

  /**
   * Log critical level message
   */
  public critical(source: string, message: string, error?: any, details?: LogDetails): void {
    const stack = error?.stack || new Error().stack;
    this.log({
      log_level: 'critical',
      source,
      message,
      stack_trace: stack,
      details: {
        ...details,
        error: error ? serializeError(error) : undefined
      }
    });
  }

  /**
   * Implement log in subclass
   */
  protected log(entry: DevLogEntry): void {
    // To be implemented in subclass
  }
}
