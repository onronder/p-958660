
import { ApiLogging } from './ApiLogging';
import { sanitizeArgs, sanitizeObject } from '../utils';

/**
 * Function wrapping functionality
 */
export class FunctionWrapping extends ApiLogging {
  /**
   * Create a function wrapper that logs execution
   */
  public wrapFunction<T extends (...args: any[]) => any>(
    source: string,
    functionName: string,
    fn: T
  ): T {
    return ((...args: any[]) => {
      if (!this.isEnabled()) return fn(...args);
      
      const { sensitiveFields } = this.getConfig();
      
      try {
        this.debug(source, `Function ${functionName} called`, { 
          arguments: sanitizeArgs(args, sensitiveFields) 
        });
        
        const startTime = performance.now();
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result
            .then(value => {
              const duration = performance.now() - startTime;
              this.debug(source, `Function ${functionName} succeeded`, { 
                result: sanitizeObject(value, sensitiveFields),
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
          result: sanitizeObject(result, sensitiveFields),
          duration: `${duration.toFixed(2)}ms`
        });
        return result;
      } catch (error) {
        this.error(source, `Function ${functionName} failed`, error);
        throw error;
      }
    }) as T;
  }
}
