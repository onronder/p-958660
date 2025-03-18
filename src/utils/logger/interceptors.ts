
import { DevLogger } from './logger';

/**
 * Set up network and browser event interceptors
 */
export function setupInterceptors(logger: DevLogger): void {
  interceptFetch(logger);
  interceptConsoleErrors(logger);
  captureRouteChanges(logger);
}

/**
 * Intercept fetch calls
 */
function interceptFetch(logger: DevLogger): void {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET');
      
      // Skip logging fetch to the dev logs endpoint to avoid recursion
      if (url.includes('dev_logs')) {
        return originalFetch(input, init);
      }

      const requestData = init?.body ? tryParseJson(init.body) : undefined;
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;
        const clonedResponse = response.clone();
        
        try {
          const contentType = clonedResponse.headers.get('content-type');
          const responseData = contentType?.includes('application/json') 
            ? await clonedResponse.json()
            : undefined;
          
          logger.logApiCall({
            source: 'Fetch', 
            endpoint: url, 
            method: method || 'GET', 
            requestData, 
            responseData,
            duration
          });
        } catch (parseError) {
          // If we can't parse the response, log what we can
          logger.logApiCall({
            source: 'Fetch', 
            endpoint: url, 
            method: method || 'GET', 
            requestData, 
            responseData: { status: clonedResponse.status, statusText: clonedResponse.statusText },
            duration
          });
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.logApiCall({
          source: 'Fetch', 
          endpoint: url, 
          method: method || 'GET', 
          requestData, 
          error,
          duration
        });
        throw error;
      }
    };
  }
}

/**
 * Intercept global errors
 */
function interceptConsoleErrors(logger: DevLogger): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error(
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
      logger.error(
        'Promise', 
        'Unhandled promise rejection', 
        event.reason
      );
    });
  }
}

/**
 * Capture route changes
 */
function captureRouteChanges(logger: DevLogger): void {
  // Log location changes
  if (typeof window !== 'undefined') {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (state, title, url) => {
      originalPushState.call(history, state, title, url);
      handleRouteChange(url?.toString() || '', logger);
    };
    
    history.replaceState = (state, title, url) => {
      originalReplaceState.call(history, state, title, url);
      handleRouteChange(url?.toString() || '', logger);
    };
    
    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.pathname, logger);
    });
    
    // Capture initial route
    handleRouteChange(window.location.pathname, logger);
  }
}

function handleRouteChange(path: string, logger: DevLogger): void {
  logger.setCurrentRoute(path);
  logger.info('Navigation', `Route changed: ${path}`);
}

function tryParseJson(data: any): any {
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
