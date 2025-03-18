
/**
 * DevLogger - A utility for comprehensive logging and debugging
 * 
 * This file is kept for backward compatibility.
 * New code should import from src/utils/logger directly.
 */

// Re-export everything from the new logger module
export * from './logger';

// Export the singleton instance for backward compatibility
import { devLogger } from './logger';
export { devLogger };
