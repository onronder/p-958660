
import React from 'react';
import { DevLog } from '@/hooks/useDevLogs';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LogItemProps {
  log: DevLog;
  isExpanded: boolean;
  onToggleExpand: (logId: string) => void;
}

export function LogItem({ log, isExpanded, onToggleExpand }: LogItemProps) {
  // Format timestamp to local time
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Function to get appropriate badge color based on log level
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'debug':
        return <Badge variant="outline" className="bg-slate-100">{level}</Badge>;
      case 'info':
        return <Badge variant="outline" className="bg-blue-100">{level}</Badge>;
      case 'warn':
        return <Badge variant="outline" className="bg-yellow-100">{level}</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100">{level}</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-200">{level}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <Collapsible 
      key={log.id} 
      open={isExpanded} 
      onOpenChange={() => onToggleExpand(log.id)}
      className="border rounded-md mb-2"
    >
      <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-50" onClick={() => onToggleExpand(log.id)}>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {getLogLevelBadge(log.log_level)}
            <Badge variant="secondary">{log.source}</Badge>
            <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
          </div>
          <div className="font-medium">{log.message}</div>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <LogDetailsContent log={log} />
      </CollapsibleContent>
    </Collapsible>
  );
}

interface LogDetailsContentProps {
  log: DevLog;
}

function LogDetailsContent({ log }: LogDetailsContentProps) {
  const renderJson = (data: any) => {
    if (!data) return null;
    return (
      <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };
  
  return (
    <div className="p-3 bg-slate-50 border-t">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <p className="text-xs font-semibold">Source</p>
          <p className="text-sm">{log.source}</p>
        </div>
        <div>
          <p className="text-xs font-semibold">User ID</p>
          <p className="text-sm">{log.user_id || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold">Route</p>
          <p className="text-sm">{log.route || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold">Time</p>
          <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
        </div>
      </div>
      {log.details && (
        <div>
          <p className="text-xs font-semibold">Details</p>
          {renderJson(log.details)}
        </div>
      )}
      {log.request_data && (
        <div>
          <p className="text-xs font-semibold">Request Data</p>
          {renderJson(log.request_data)}
        </div>
      )}
      {log.response_data && (
        <div>
          <p className="text-xs font-semibold">Response Data</p>
          {renderJson(log.response_data)}
        </div>
      )}
      {log.stack_trace && (
        <div>
          <p className="text-xs font-semibold">Stack Trace</p>
          <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-40">
            {log.stack_trace}
          </pre>
        </div>
      )}
    </div>
  );
}
