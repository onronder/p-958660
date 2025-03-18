
import { useState, useCallback } from 'react';
import { LogFilters } from './types';

export function useLogFilters() {
  const [filters, setFilters] = useState<LogFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevelFilters, setLogLevelFilters] = useState<string[]>([
    'debug', 'info', 'warn', 'error', 'critical'
  ]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const updateLogLevelFilters = useCallback((levels: string[]) => {
    setLogLevelFilters(levels);
  }, []);

  const applyFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setLogLevelFilters(['debug', 'info', 'warn', 'error', 'critical']);
  }, []);

  return {
    filters,
    searchTerm,
    logLevelFilters,
    updateSearchTerm,
    updateLogLevelFilters,
    applyFilters,
    clearFilters
  };
}
