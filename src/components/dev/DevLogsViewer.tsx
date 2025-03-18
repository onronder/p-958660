
import React, { useState, useEffect, useCallback } from 'react';
import { useDevLogs } from '@/hooks/dev-logs';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LogHeader } from './LogHeader';
import { LogFilters } from './LogFilters';
import { LogList } from './LogList';
import { LogFooter } from './LogFooter';
import { ErrorDisplay } from './ErrorDisplay';

interface DevLogsViewerProps {
  logLevelFilters?: string[];
}

export function DevLogsViewer({ logLevelFilters = ['debug', 'info', 'warn', 'error', 'critical'] }: DevLogsViewerProps) {
  const { 
    logs, 
    isLoading, 
    error, 
    logCount, 
    loadLogs, 
    clearLogs, 
    toggleLogging, 
    togglePersistence, 
    filterLogsByTerm 
  } = useDevLogs();
  
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(true);
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  // Handle filtering
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = logLevelFilters.includes(log.log_level);
    
    return matchesSearch && matchesLevel;
  });

  // Load logs with filter support
  const loadFilteredLogs = useCallback(() => {
    loadLogs(100, 0, {});
  }, [loadLogs]);

  // Initial load
  useEffect(() => {
    loadFilteredLogs();
  }, [loadFilteredLogs]);

  // Refetch when filters change
  useEffect(() => {
    loadFilteredLogs();
  }, [logLevelFilters, loadFilteredLogs]);

  // Handle toggling individual log details
  const toggleLogExpand = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  // Handle toggling logging
  const handleToggleLogging = (enabled: boolean) => {
    setIsLoggingEnabled(enabled);
    toggleLogging(enabled);
  };
  
  // Handle toggling persistence
  const handleTogglePersistence = (enabled: boolean) => {
    setIsPersistenceEnabled(enabled);
    togglePersistence(enabled);
  };

  // Collapse all expanded logs
  const collapseAll = () => {
    setExpandedLogs({});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <LogHeader 
          isLoading={isLoading}
          onRefresh={loadFilteredLogs}
          totalLogs={logCount}
          displayedLogs={filteredLogs.length}
        />
      </CardHeader>
      <CardContent>
        <LogFilters 
          onSearch={setSearchTerm}
          isLoggingEnabled={isLoggingEnabled}
          isPersistenceEnabled={isPersistenceEnabled}
          onToggleLogging={handleToggleLogging}
          onTogglePersistence={handleTogglePersistence}
        />

        <ErrorDisplay error={error} />

        <LogList 
          logs={filteredLogs}
          isLoading={isLoading}
          expandedLogs={expandedLogs}
          toggleLogExpand={toggleLogExpand}
        />
      </CardContent>
      <LogFooter 
        displayedLogs={filteredLogs.length}
        totalLogs={logCount}
        onCollapseAll={collapseAll}
        hasLogs={logs.length > 0}
      />
    </Card>
  );
}
