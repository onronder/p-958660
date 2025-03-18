
import { DevLoggerConfig } from '../config';
import { DevLogEntry, LogDetails, LogLevel } from '../types';
import { sanitizeObject } from '../utils';

/**
 * Core Logger functionality 
 */
export class LoggerCore {
  private userId: string | null = null;
  private currentRoute: string | null = null;
  private config: DevLoggerConfig;

  constructor(config: DevLoggerConfig) {
    this.config = config;
  }

  /**
   * Set the current user ID for logs
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Set the current route for logs
   */
  public setCurrentRoute(route: string): void {
    this.currentRoute = route;
  }

  /**
   * Create an enhanced log entry with user and route context
   */
  protected enhanceLogEntry(entry: DevLogEntry): DevLogEntry {
    return {
      ...entry,
      user_id: entry.user_id || this.userId || null,
      route: entry.route || this.currentRoute || null,
      timestamp: entry.timestamp || new Date().toISOString()
    };
  }

  /**
   * Get the current configuration
   */
  public getConfig(): DevLoggerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration options
   */
  public updateConfig(options: Partial<DevLoggerConfig>): DevLoggerConfig {
    this.config = { ...this.config, ...options };
    return this.getConfig();
  }

  /**
   * Check if logging is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if log persistence is enabled
   */
  public isPersistEnabled(): boolean {
    return this.config.persistLogs;
  }
}
