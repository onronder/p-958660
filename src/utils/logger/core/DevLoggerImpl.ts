
import { supabase } from "@/integrations/supabase/client";
import { FunctionWrapping } from './FunctionWrapping';
import { DevLoggerConfig, DEFAULT_CONFIG } from '../config';
import { DevLogEntry } from '../types';
import { logStorage } from '../storage';
import { consoleAdapter } from '../console';

/**
 * DevLogger Implementation - Final class with all functionality
 */
export class DevLoggerImpl extends FunctionWrapping {
  private static instance: DevLoggerImpl;
  
  private constructor() {
    super(DEFAULT_CONFIG);
    // Initialize user info
    this.captureUserInfo();
  }

  /**
   * Get the singleton instance of DevLogger
   */
  public static getInstance(): DevLoggerImpl {
    if (!DevLoggerImpl.instance) {
      DevLoggerImpl.instance = new DevLoggerImpl();
    }
    return DevLoggerImpl.instance;
  }

  /**
   * Configure the logger
   */
  public configure(options: Partial<DevLoggerConfig>): void {
    const newConfig = this.updateConfig(options);
    
    // Update dependent components
    consoleAdapter.setConfig(newConfig);
    logStorage.setPersistEnabled(newConfig.persistLogs);
    
    console.log(`DevLogger configuration updated:`, newConfig);
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.updateConfig({ enabled });
    console.log(`DevLogger is now ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable or disable log persistence to database
   */
  public setPersistLogs(persist: boolean): void {
    this.updateConfig({ persistLogs: persist });
    logStorage.setPersistEnabled(persist);
    console.log(`DevLogger persistence is now ${persist ? 'enabled' : 'disabled'}`);
  }

  /**
   * Log a message to dev_logs
   */
  protected log(entry: DevLogEntry): void {
    if (!this.isEnabled()) return;

    try {
      // Add user and route context if available
      const enhancedEntry = this.enhanceLogEntry(entry);
      
      // Log to console for immediate feedback
      consoleAdapter.logToConsole(enhancedEntry);
      
      // Store in database if persistence is enabled
      if (this.isPersistEnabled()) {
        logStorage.storeLog(enhancedEntry);
      }
    } catch (error) {
      // Fail silently but log to console to avoid recursive errors
      console.error('DevLogger failed to log:', error);
    }
  }

  /**
   * Clear all logs - admin function
   */
  public async clearAllLogs(): Promise<void> {
    return logStorage.clearAllLogs();
  }

  /**
   * Fetch logs with filtering
   */
  public async fetchLogs(
    limit: number = 100,
    offset: number = 0,
    filters: Record<string, any> = {}
  ) {
    return logStorage.fetchLogs(limit, offset, filters);
  }

  private captureUserInfo(): void {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.setUserId(session?.user?.id || null);
      this.info('Auth', `Auth state changed: ${event}`, { user: session?.user?.id || null });
    });
  }
}

/**
 * Export the singleton instance
 */
export const devLoggerImpl = DevLoggerImpl.getInstance();
