
import { supabase } from "@/integrations/supabase/client";
import { LogLevel, DevLogEntry, LogDetails, ApiCallLogOptions } from './types';
import { DevLoggerConfig, DEFAULT_CONFIG } from './config';
import { serializeError, sanitizeObject, sanitizeArgs } from './utils';
import { logStorage } from './storage';
import { consoleAdapter } from './console';

/**
 * DevLogger - A utility for comprehensive logging and debugging
 * 
 * This class provides methods to log various events, API calls, and errors
 * across the application, storing them in the dev_logs table for analysis.
 */
export class DevLogger {
  private static instance: DevLogger;
  private userId: string | null = null;
  private currentRoute: string | null = null;
  private config: DevLoggerConfig = DEFAULT_CONFIG;
  
  private constructor() {
    // Initialize user info
    this.captureUserInfo();
  }

  /**
   * Get the singleton instance of DevLogger
   */
  public static getInstance(): DevLogger {
    if (!DevLogger.instance) {
      DevLogger.instance = new DevLogger();
    }
    return DevLogger.instance;
  }

  /**
   * Update configuration options
   */
  public configure(options: Partial<DevLoggerConfig>): void {
    this.config = { ...this.config, ...options };
    
    // Update dependent components
    consoleAdapter.setConfig(this.config);
    logStorage.setPersistEnabled(this.config.persistLogs);
    
    console.log(`DevLogger configuration updated:`, this.config);
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`DevLogger is now ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable or disable log persistence to database
   */
  public setPersistLogs(persist: boolean): void {
    this.config.persistLogs = persist;
    logStorage.setPersistEnabled(persist);
    console.log(`DevLogger persistence is now ${persist ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set the current user ID for logs
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Set the current route for logs
   */
  public setCurrentRoute(route: string): void {
    this.currentRoute = route;
  }

  /**
   * Log a message to dev_logs
   */
  public async log(entry: DevLogEntry): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Add user and route context if available
      const enhancedEntry = {
        ...entry,
        user_id: entry.user_id || this.userId || null,
        route: entry.route || this.currentRoute || null
      };
      
      // Log to console for immediate feedback
      consoleAdapter.logToConsole(enhancedEntry);
      
      // Store in database if persistence is enabled
      if (this.config.persistLogs) {
        await logStorage.storeLog(enhancedEntry);
      }
    } catch (error) {
      // Fail silently but log to console to avoid recursive errors
      console.error('DevLogger failed to log:', error);
    }
  }

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
   * Log API call
   */
  public logApiCall(options: ApiCallLogOptions): void {
    const { 
      source, 
      endpoint, 
      method, 
      requestData, 
      responseData, 
      error,
      duration
    } = options;
    
    const logLevel: LogLevel = error ? 'error' : 'info';
    
    this.log({
      log_level: logLevel,
      source,
      message: `${method} ${endpoint}`,
      request_data: requestData,
      response_data: responseData,
      stack_trace: error?.stack,
      details: {
        success: !error,
        duration: duration || 0,
        error: error ? serializeError(error) : undefined
      }
    });
  }

  /**
   * Create a function wrapper that logs execution
   */
  public wrapFunction<T extends (...args: any[]) => any>(
    source: string,
    functionName: string,
    fn: T
  ): T {
    return ((...args: any[]) => {
      if (!this.config.enabled) return fn(...args);
      
      try {
        this.debug(source, `Function ${functionName} called`, { 
          arguments: sanitizeArgs(args, this.config.sensitiveFields) 
        });
        
        const startTime = performance.now();
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result
            .then(value => {
              const duration = performance.now() - startTime;
              this.debug(source, `Function ${functionName} succeeded`, { 
                result: sanitizeObject(value, this.config.sensitiveFields),
                duration: `${duration.toFixed(2)}ms`
              });
              return value;
            })
            .catch(error => {
              const duration = performance.now() - startTime;
              this.error(source, `Function ${functionName} failed`, error, {
                duration: `${duration.toFixed(2)}ms`
              });
              throw error;
            });
        }
        
        // Handle synchronous functions
        const duration = performance.now() - startTime;
        this.debug(source, `Function ${functionName} succeeded`, { 
          result: sanitizeObject(result, this.config.sensitiveFields),
          duration: `${duration.toFixed(2)}ms`
        });
        return result;
      } catch (error) {
        this.error(source, `Function ${functionName} failed`, error);
        throw error;
      }
    }) as T;
  }

  /**
   * Log component renders and updates
   */
  public logComponentLifecycle(componentName: string, phase: 'mount' | 'update' | 'unmount', props?: any): void {
    this.debug('Component', `${componentName} ${phase}`, { 
      props: sanitizeObject(props, this.config.sensitiveFields) 
    });
  }

  /**
   * Clear all logs - admin function
   */
  public async clearAllLogs(): Promise<void> {
    return logStorage.clearAllLogs();
  }

  /**
   * Fetch logs with filtering
   */
  public async fetchLogs(
    limit: number = 100,
    offset: number = 0,
    filters: Record<string, any> = {}
  ) {
    return logStorage.fetchLogs(limit, offset, filters);
  }

  private captureUserInfo(): void {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.setUserId(session?.user?.id || null);
      this.info('Auth', `Auth state changed: ${event}`, { user: session?.user?.id || null });
    });
  }
}
