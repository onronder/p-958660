
import React, { useEffect } from 'react';
import { DevLogger } from './logger';

/**
 * HOC for logging React component lifecycle
 */
export function withLogging<P>(
  Component: React.ComponentType<P>,
  logger: DevLogger,
  componentName: string = Component.displayName || Component.name
): React.FC<P> {
  return (props: P) => {
    useEffect(() => {
      logger.logComponentLifecycle(componentName, 'mount', props);
      return () => {
        logger.logComponentLifecycle(componentName, 'unmount');
      };
    }, []);

    useEffect(() => {
      logger.logComponentLifecycle(componentName, 'update', props);
    }, [props]);

    return React.createElement(Component, props);
  };
}

/**
 * Wrapper for logging hook usage
 */
export function wrapHook<T extends (...args: any[]) => any>(
  hookName: string,
  hook: T,
  logger: DevLogger
): T {
  return logger.wrapFunction('Hook', hookName, hook);
}

/**
 * Hook for accessing the logger in components
 */
export function useLogger(logger: DevLogger) {
  return {
    debug: (source: string, message: string, details?: any) => 
      logger.debug(source, message, details),
    info: (source: string, message: string, details?: any) => 
      logger.info(source, message, details),
    warn: (source: string, message: string, details?: any) => 
      logger.warn(source, message, details),
    error: (source: string, message: string, error?: any, details?: any) => 
      logger.error(source, message, error, details),
    critical: (source: string, message: string, error?: any, details?: any) => 
      logger.critical(source, message, error, details)
  };
}
