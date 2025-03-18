
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { devLogger } from './logger';
import type { DevLoggerImpl } from './core/DevLoggerImpl';

/**
 * HOC to wrap components with logging
 */
export function withLogging<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  logger: typeof devLogger = devLogger
) {
  const WithLogging: React.FC<P> = (props) => {
    useEffect(() => {
      // Log component mount
      logger.debug('Component', `${componentName} mounted`, { props });
      
      // Log component unmount
      return () => {
        logger.debug('Component', `${componentName} unmounted`);
      };
    }, []);
    
    // Log rendering and pass props through
    return <Component {...props} />;
  };
  
  WithLogging.displayName = `withLogging(${componentName})`;
  return WithLogging;
}

/**
 * Hook wrapper for custom hooks
 */
export function wrapHook<T extends (...args: any[]) => any>(
  hook: T,
  hookName: string,
  logger: typeof devLogger = devLogger
): T {
  return devLogger.wrapFunction('Hook', hookName, hook) as T;
}

/**
 * Component hook for using the logger
 */
export function useLogger() {
  const location = useLocation();
  
  useEffect(() => {
    devLogger.setCurrentRoute(location.pathname);
  }, [location.pathname]);
  
  return devLogger;
}
