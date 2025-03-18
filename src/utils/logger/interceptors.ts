
import { devLogger } from './logger';
import type { DevLoggerImpl } from './core/DevLoggerImpl';

/**
 * Intercept and log fetch requests
 */
function setupFetchInterceptor(logger: typeof devLogger): void {
  // Store the original fetch function
  const originalFetch = window.fetch;

  // Replace with our intercepted version
  window.fetch = async function interceptedFetch(input, init) {
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || (typeof input === 'string' ? 'GET' : input.method) || 'GET';
    const startTime = performance.now();
    
    try {
      // Log the request
      logger.debug('Fetch', `${method} request to ${url}`, {
        url,
        method,
        headers: init?.headers,
        body: init?.body ? getSafeBody(init.body) : undefined
      });
      
      // Execute the original fetch
      const response = await originalFetch.apply(window, [input, init]);
      
      // Clone the response so we can read the body
      const clonedResponse = response.clone();
      
      try {
        // Try to get the response body as JSON
        const responseData = await getResponseData(clonedResponse);
        const duration = performance.now() - startTime;
        
        // Log the successful response
        logger.debug('Fetch', `${method} response from ${url}`, {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseData,
          duration: `${duration.toFixed(2)}ms`
        });
      } catch (parseError) {
        // If we can't parse the response, just log without body
        const duration = performance.now() - startTime;
        logger.debug('Fetch', `${method} response from ${url} (unparseable body)`, {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration.toFixed(2)}ms`
        });
      }
      
      return response;
    } catch (error: any) {
      // Log fetch errors
      const duration = performance.now() - startTime;
      logger.error('Fetch', `${method} request to ${url} failed`, error, {
        url,
        method,
        duration: `${duration.toFixed(2)}ms`
      });
      
      throw error;
    }
  };
}

/**
 * Intercept and log XMLHttpRequest requests
 */
function setupXhrInterceptor(logger: typeof devLogger): void {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function interceptedOpen(method, url, ...rest) {
    // Store request details for later logging
    this._devLoggerRequestInfo = {
      method,
      url: url?.toString() || 'unknown',
      startTime: 0
    };
    
    // Call original method
    return originalOpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.send = function interceptedSend(body) {
    if (this._devLoggerRequestInfo) {
      this._devLoggerRequestInfo.startTime = performance.now();
      
      // Log the request
      logger.debug('XMLHttpRequest', `${this._devLoggerRequestInfo.method} request to ${this._devLoggerRequestInfo.url}`, {
        method: this._devLoggerRequestInfo.method,
        url: this._devLoggerRequestInfo.url,
        body: body ? getSafeBody(body) : undefined
      });
      
      // Set up response handler
      this.addEventListener('loadend', function() {
        const duration = performance.now() - this._devLoggerRequestInfo.startTime;
        
        if (this.status >= 200 && this.status < 400) {
          // Success response
          logger.debug('XMLHttpRequest', `${this._devLoggerRequestInfo.method} response from ${this._devLoggerRequestInfo.url}`, {
            method: this._devLoggerRequestInfo.method,
            url: this._devLoggerRequestInfo.url,
            status: this.status,
            statusText: this.statusText,
            responseType: this.responseType,
            responseSize: this.responseText?.length || 0,
            duration: `${duration.toFixed(2)}ms`
          });
        } else if (this.status > 0) {
          // Error response
          logger.warn('XMLHttpRequest', `${this._devLoggerRequestInfo.method} request to ${this._devLoggerRequestInfo.url} failed`, {
            method: this._devLoggerRequestInfo.method,
            url: this._devLoggerRequestInfo.url,
            status: this.status,
            statusText: this.statusText,
            responseType: this.responseType,
            responseSize: this.responseText?.length || 0,
            duration: `${duration.toFixed(2)}ms`
          });
        }
      });
    }
    
    // Call original method
    return originalSend.apply(this, [body]);
  };
}

/**
 * Try to get response data in a safe way
 */
async function getResponseData(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return await response.json();
  } else if (contentType?.includes('text/')) {
    return await response.text();
  }
  
  return '[Binary data]';
}

/**
 * Get safe representation of request body for logging
 */
function getSafeBody(body: any): any {
  if (!body) return undefined;
  
  if (typeof body === 'string') {
    // Try to parse as JSON if it looks like JSON
    if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body.length > 500 ? `${body.substring(0, 500)}... [truncated]` : body;
      }
    }
    return body.length > 500 ? `${body.substring(0, 500)}... [truncated]` : body;
  }
  
  // Handle FormData
  if (body instanceof FormData) {
    const formDataObj: Record<string, any> = {};
    body.forEach((value, key) => {
      formDataObj[key] = value;
    });
    return formDataObj;
  }
  
  return body;
}

/**
 * Set up all interceptors
 */
export function setupInterceptors(logger: typeof devLogger): void {
  try {
    setupFetchInterceptor(logger);
    setupXhrInterceptor(logger);
    console.log('DevLogger interceptors configured');
  } catch (error) {
    console.error('Failed to set up DevLogger interceptors:', error);
  }
}
