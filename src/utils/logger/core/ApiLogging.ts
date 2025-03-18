
import { LoggingFunctions } from './LoggingFunctions';
import { ApiCallLogOptions, LogLevel } from '../types';

/**
 * API call logging extension
 */
export class ApiLogging extends LoggingFunctions {
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
   * Log component renders and updates
   */
  public logComponentLifecycle(componentName: string, phase: 'mount' | 'update' | 'unmount', props?: any): void {
    const { sensitiveFields } = this.getConfig();
    this.debug('Component', `${componentName} ${phase}`, { 
      props: props ? sanitizeObject(props, sensitiveFields) : undefined
    });
  }
}

// Need to import these here for the methods to work
import { serializeError, sanitizeObject } from '../utils';
