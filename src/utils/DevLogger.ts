
import { supabase } from "@/integrations/supabase/client";

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogDetails {
  [key: string]: any;
}

interface DevLogEntry {
  log_level: LogLevel;
  source: string;
  message: string;
  details?: LogDetails;
  user_id?: string;
  route?: string;
  stack_trace?: string;
  request_data?: any;
  response_data?: any;
}

/**
 * DevLogger - A utility for comprehensive logging and debugging
 * 
 * This class provides methods to log various events, API calls, and errors
 * across the application, storing them in the dev_logs table for analysis.
 */
class DevLogger {
  private static instance: DevLogger;
  private userId: string | null = null;
  private currentRoute: string | null = null;
  private enabled: boolean = true;
  
  private constructor() {
    // Initialize logger
    this.captureUserInfo();
    this.captureRouteChanges();
    this.interceptFetch();
    this.interceptSupabase();
    this.interceptConsoleErrors();
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
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`DevLogger is now ${enabled ? 'enabled' : 'disabled'}`);
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
    if (!this.enabled) return;

    try {
      // Add user and route context if available
      const enhancedEntry = {
        ...entry,
        user_id: entry.user_id || this.userId || null,
        route: entry.route || this.currentRoute || null
      };
      
      // Log to console for immediate feedback
      this.logToConsole(enhancedEntry);
      
      // Store in database
      await this.storeLog(enhancedEntry);
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
        error: error ? this.serializeError(error) : undefined
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
        error: error ? this.serializeError(error) : undefined
      }
    });
  }

  /**
   * Log API call
   */
  public logApiCall(
    source: string,
    endpoint: string,
    method: string,
    requestData?: any,
    responseData?: any,
    error?: any
  ): void {
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
        duration: 0, // Could add timing later
        error: error ? this.serializeError(error) : undefined
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
      try {
        this.debug(source, `Function ${functionName} called`, { arguments: this.sanitizeArgs(args) });
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result
            .then(value => {
              this.debug(source, `Function ${functionName} succeeded`, { result: this.sanitizeResult(value) });
              return value;
            })
            .catch(error => {
              this.error(source, `Function ${functionName} failed`, error);
              throw error;
            });
        }
        
        // Handle synchronous functions
        this.debug(source, `Function ${functionName} succeeded`, { result: this.sanitizeResult(result) });
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
    this.debug('Component', `${componentName} ${phase}`, { props: this.sanitizeResult(props) });
  }

  /**
   * Clear all logs - admin function
   */
  public async clearAllLogs(): Promise<void> {
    try {
      await supabase.from('dev_logs').delete().gt('id', '0');
      console.log('All dev logs cleared');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  // Private methods

  private async storeLog(entry: DevLogEntry): Promise<void> {
    try {
      const { error } = await supabase.from('dev_logs').insert([entry]);
      if (error) {
        console.error('Failed to store log entry:', error);
      }
    } catch (storeError) {
      console.error('Exception storing log entry:', storeError);
    }
  }

  private logToConsole(entry: DevLogEntry): void {
    const prefix = `[${entry.log_level.toUpperCase()}] [${entry.source}]`;
    
    switch (entry.log_level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.details || '');
        break;
      case 'info':
        console.info(prefix, entry.message, entry.details || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.details || '');
        break;
      case 'error':
      case 'critical':
        console.error(prefix, entry.message, entry.details || '', entry.stack_trace || '');
        break;
    }
  }

  private sanitizeArgs(args: any[]): any[] {
    // Remove sensitive data like passwords, tokens, etc.
    return args.map(arg => this.sanitizeObject(arg));
  }

  private sanitizeResult(result: any): any {
    return this.sanitizeObject(result);
  }

  private sanitizeObject(obj: any): any {
    if (!obj) return obj;
    
    try {
      // For simple primitives, return as is
      if (typeof obj !== 'object') return obj;
      
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => this.sanitizeObject(item));
      }
      
      // Handle objects
      const sanitized = { ...obj };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'apiKey', 'api_token', 'apiToken'];
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      return sanitized;
    } catch (e) {
      // If sanitization fails, return a safe representation
      return typeof obj;
    }
  }

  private serializeError(error: any): any {
    if (!error) return null;
    
    return {
      message: error.message || String(error),
      name: error.name || 'Error',
      stack: error.stack,
      code: error.code,
      status: error.status,
      ...(typeof error === 'object' ? { ...this.sanitizeObject(error) } : {})
    };
  }

  private captureUserInfo(): void {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.setUserId(session?.user?.id || null);
      this.info('Auth', `Auth state changed: ${event}`, { user: session?.user?.id || null });
    });
  }

  private captureRouteChanges(): void {
    // Log location changes
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = (state, title, url) => {
        originalPushState.call(history, state, title, url);
        this.handleRouteChange(url?.toString() || '');
      };
      
      history.replaceState = (state, title, url) => {
        originalReplaceState.call(history, state, title, url);
        this.handleRouteChange(url?.toString() || '');
      };
      
      window.addEventListener('popstate', () => {
        this.handleRouteChange(window.location.pathname);
      });
      
      // Capture initial route
      this.handleRouteChange(window.location.pathname);
    }
  }

  private handleRouteChange(path: string): void {
    this.setCurrentRoute(path);
    this.info('Navigation', `Route changed: ${path}`);
  }

  private interceptFetch(): void {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      
      window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const method = init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET');
        
        // Skip logging fetch to the dev logs endpoint to avoid recursion
        if (url.includes('dev_logs')) {
          return originalFetch(input, init);
        }

        const requestData = init?.body ? this.tryParseJson(init.body) : undefined;
        
        try {
          const response = await originalFetch(input, init);
          const clonedResponse = response.clone();
          
          try {
            const contentType = clonedResponse.headers.get('content-type');
            const responseData = contentType?.includes('application/json') 
              ? await clonedResponse.json()
              : undefined;
            
            this.logApiCall(
              'Fetch', 
              url, 
              method || 'GET', 
              requestData, 
              responseData
            );
          } catch (parseError) {
            // If we can't parse the response, log what we can
            this.logApiCall(
              'Fetch', 
              url, 
              method || 'GET', 
              requestData, 
              { status: clonedResponse.status, statusText: clonedResponse.statusText }
            );
          }
          
          return response;
        } catch (error) {
          this.logApiCall(
            'Fetch', 
            url, 
            method || 'GET', 
            requestData, 
            undefined, 
            error
          );
          throw error;
        }
      };
    }
  }

  private interceptSupabase(): void {
    // Ideally, we would intercept Supabase client calls
    // This is complex and would require modifying the client
    // As a simpler alternative, we could use a proxy or hook into specific methods
  }

  private interceptConsoleErrors(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error(
          'Window', 
          `Uncaught error: ${event.message}`, 
          event.error, 
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        );
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.error(
          'Promise', 
          'Unhandled promise rejection', 
          event.reason
        );
      });
    }
  }

  private tryParseJson(data: any): any {
    if (!data) return undefined;
    if (typeof data === 'object') return data;
    
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    
    return data;
  }
}

// Export as singleton
export const devLogger = DevLogger.getInstance();

// Export helper HOC for React components
export function withLogging<P>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name
): React.FC<P> {
  return (props: P) => {
    React.useEffect(() => {
      devLogger.logComponentLifecycle(componentName, 'mount', props);
      return () => {
        devLogger.logComponentLifecycle(componentName, 'unmount');
      };
    }, []);

    React.useEffect(() => {
      devLogger.logComponentLifecycle(componentName, 'update', props);
    }, [props]);

    return React.createElement(Component, props);
  };
}

// Export helper for hooks
export function wrapHook<T extends (...args: any[]) => any>(
  hookName: string,
  hook: T
): T {
  return devLogger.wrapFunction('Hook', hookName, hook);
}
