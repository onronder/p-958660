
import React from 'react';
import { DevLog } from '@/hooks/dev-logs';
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogItem } from './LogItem';

interface LogListProps {
  logs: DevLog[];
  isLoading: boolean;
  expandedLogs: Record<string, boolean>;
  toggleLogExpand: (logId: string) => void;
}

export function LogList({ logs, isLoading, expandedLogs, toggleLogExpand }: LogListProps) {
  return (
    <ScrollArea className="h-[500px] rounded-md border">
      <div className="p-4 space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {isLoading ? 'Loading logs...' : 'No logs found'}
          </div>
        ) : (
          logs.map((log: DevLog) => (
            <LogItem 
              key={log.id}
              log={log}
              isExpanded={expandedLogs[log.id] || false}
              onToggleExpand={toggleLogExpand}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
