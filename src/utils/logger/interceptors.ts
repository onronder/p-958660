
import { devLogger } from '@/utils/logger';

// Intercept fetch calls
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function(input: URL | RequestInfo, init?: RequestInit) {
    const startTime = Date.now();
    const url = input instanceof Request ? input.url : input.toString();
    const method = input instanceof Request ? input.method : (init?.method || 'GET');
    
    try {
      // Log the request
      devLogger.debug('Fetch Request', `${method} ${url}`, {
        method,
        url,
        headers: init?.headers || {},
        body: init?.body,
      });

      // Perform the actual fetch
      const response = await originalFetch.apply(window, [input, init]);
      
      // Calculate request duration
      const duration = Date.now() - startTime;
      
      // Clone the response to be able to read the body
      const responseClone = response.clone();
      
      // Log the response
      try {
        const responseBody = await responseClone.text();
        const contentType = response.headers.get('content-type');
        
        let parsedBody;
        try {
          if (contentType && contentType.includes('application/json')) {
            parsedBody = JSON.parse(responseBody);
          } else {
            parsedBody = responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : '');
          }
        } catch (error) {
          parsedBody = responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : '');
        }
        
        devLogger.debug('Fetch Response', `${method} ${url} - ${response.status} (${duration}ms)`, {
          status: response.status,
          duration,
          size: responseBody.length,
          headers: Object.fromEntries(response.headers.entries()),
          body: parsedBody,
        });
      } catch (error) {
        // We can't log the response body, but we can still log other stuff
        devLogger.debug('Fetch Response', `${method} ${url} - ${response.status} (${duration}ms)`, {
          status: response.status,
          duration,
          headers: Object.fromEntries(response.headers.entries()),
          error: 'Could not parse response body',
        });
      }
      
      return response;
    } catch (error) {
      // Log the error
      devLogger.error('Fetch Error', `${method} ${url}`, error);
      throw error;
    }
  };
  
  // Return a function to restore the original fetch
  return () => {
    window.fetch = originalFetch;
  };
}
