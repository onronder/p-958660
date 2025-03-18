
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { devLogger } from '@/utils/logger';
import { DevLog } from './types';
import { fetchLogs, clearAllLogs } from './devLogsApiService';

export function useDevLogs() {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logCount, setLogCount] = useState(0);
  const { user } = useAuth();

  // Function to load logs
  const loadLogs = useCallback(async (
    limit: number = 100,
    offset: number = 0,
    filters: Record<string, any> = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchLogs(limit, offset, filters);
      
      if (result.error) {
        setError(result.error);
      } else {
        setLogs(result.logs);
        setLogCount(result.count);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
      console.error('Error in useDevLogs loadLogs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to clear logs
  const clearLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await clearAllLogs();
      
      if (result.error) {
        setError(result.error);
      } else {
        await loadLogs();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to clear logs');
      console.error('Error clearing logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadLogs]);

  // Enable/disable logging
  const toggleLogging = useCallback((enabled: boolean) => {
    devLogger.setEnabled(enabled);
  }, []);
  
  // Enable/disable persistence
  const togglePersistence = useCallback((enabled: boolean) => {
    devLogger.setPersistLogs(enabled);
  }, []);

  // Apply search filtering to logs
  const filterLogsByTerm = useCallback((logs: DevLog[], searchTerm: string): DevLog[] => {
    if (!searchTerm) return logs;
    
    const term = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.message.toLowerCase().includes(term) || 
      log.source.toLowerCase().includes(term)
    );
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user, loadLogs]);

  return {
    logs,
    isLoading,
    error,
    logCount,
    loadLogs,
    clearLogs,
    toggleLogging,
    togglePersistence,
    filterLogsByTerm
  };
}
