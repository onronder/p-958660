
import { LogDetails } from './types';

/**
 * Safely serialize an error object
 */
export function serializeError(error: any): any {
  if (!error) return null;
  
  return {
    message: error.message || String(error),
    name: error.name || 'Error',
    stack: error.stack,
    code: error.code,
    status: error.status,
    ...(typeof error === 'object' ? { ...sanitizeObject(error) } : {})
  };
}

/**
 * Try to parse JSON data
 */
export function tryParseJson(data: any): any {
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

/**
 * Sanitize an object by removing sensitive data
 */
export function sanitizeObject(obj: any, sensitiveFields: string[] = []): any {
  if (!obj) return obj;
  
  try {
    // For simple primitives, return as is
    if (typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item, sensitiveFields));
    }
    
    // Handle objects
    const sanitized = { ...obj };
    
    // Redact sensitive fields
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

/**
 * Safely sanitize function arguments
 */
export function sanitizeArgs(args: any[], sensitiveFields: string[] = []): any[] {
  return args.map(arg => sanitizeObject(arg, sensitiveFields));
}

/**
 * Get the current route from window location
 */
export function getCurrentRoute(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '';
}

/**
 * Truncate large objects for console output
 */
export function truncateForConsole(data: any, maxSize: number = 10000): any {
  if (!data) return data;
  
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  if (str.length <= maxSize) return data;
  
  if (typeof data === 'string') {
    return data.substring(0, maxSize) + '... [truncated]';
  }
  
  return {
    __truncated: true,
    message: `Object was truncated because it exceeded ${maxSize} characters`,
    preview: JSON.stringify(data).substring(0, 200) + '...'
  };
}
