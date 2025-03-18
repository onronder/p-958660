
/**
 * DevLogger - Main export file that re-exports the implementation
 */
import { devLoggerImpl } from './core/DevLoggerImpl';

/**
 * DevLogger - A utility for comprehensive logging and debugging
 * 
 * Re-export the implementation as DevLogger for backward compatibility
 */
export const DevLogger = {
  getInstance: () => devLoggerImpl
};

// Export the singleton instance
export { devLoggerImpl as devLogger };
