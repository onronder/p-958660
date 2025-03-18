
import { DevLogger } from './logger';
import { setupInterceptors } from './interceptors';
import { withLogging, wrapHook, useLogger } from './react';
import { DEFAULT_CONFIG, DevLoggerConfig } from './config';

// Create and export singleton instance
const devLogger = DevLogger.getInstance();

// Set up interceptors
setupInterceptors(devLogger);

// Re-export everything
export {
  devLogger,
  withLogging,
  wrapHook,
  useLogger,
  DEFAULT_CONFIG
};

// Export types
export type { DevLoggerConfig };
export * from './types';
