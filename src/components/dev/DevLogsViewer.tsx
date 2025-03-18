
import React, { useState, useEffect, useCallback } from 'react';
import { useDevLogs, DevLog } from '@/hooks/useDevLogs';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, RefreshCw, Trash2, Search } from "lucide-react";
import { debounce } from 'lodash';

interface DevLogsViewerProps {
  logLevelFilters?: string[];
}

export function DevLogsViewer({ logLevelFilters = ['debug', 'info', 'warn', 'error', 'critical'] }: DevLogsViewerProps) {
  const { logs, isLoading, error, logCount, loadLogs, clearLogs, toggleLogging } = useDevLogs();
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(true);
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

  // Handle search with debounce
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

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

  // Format timestamp to local time
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Render JSON data in a formatted way
  const renderJson = (data: any) => {
    if (!data) return null;
    return (
      <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Development Logs</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadFilteredLogs()} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Viewing {filteredLogs.length} of {logCount} logs. Use these logs to debug API calls and application errors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="logging-enabled"
                checked={isLoggingEnabled}
                onCheckedChange={handleToggleLogging}
              />
              <Label htmlFor="logging-enabled">Logging Enabled</Label>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-2 rounded mb-4">
            Error: {error}
          </div>
        )}

        <ScrollArea className="h-[500px] rounded-md border">
          <div className="p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isLoading ? 'Loading logs...' : 'No logs found'}
              </div>
            ) : (
              filteredLogs.map((log: DevLog) => (
                <Collapsible 
                  key={log.id} 
                  open={expandedLogs[log.id]} 
                  onOpenChange={() => toggleLogExpand(log.id)}
                  className="border rounded-md mb-2"
                >
                  <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-50" onClick={() => toggleLogExpand(log.id)}>
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
                        {expandedLogs[log.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="p-3 bg-slate-50 border-t">
                      <Tabs defaultValue="details">
                        <TabsList>
                          <TabsTrigger value="details">Details</TabsTrigger>
                          {log.request_data && <TabsTrigger value="request">Request</TabsTrigger>}
                          {log.response_data && <TabsTrigger value="response">Response</TabsTrigger>}
                          {log.stack_trace && <TabsTrigger value="stack">Stack Trace</TabsTrigger>}
                        </TabsList>
                        <TabsContent value="details" className="py-2">
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
                              <p className="text-sm">{formatTimestamp(log.timestamp)}</p>
                            </div>
                          </div>
                          {log.details && (
                            <div>
                              <p className="text-xs font-semibold">Details</p>
                              {renderJson(log.details)}
                            </div>
                          )}
                        </TabsContent>
                        {log.request_data && (
                          <TabsContent value="request" className="py-2">
                            <p className="text-xs font-semibold">Request Data</p>
                            {renderJson(log.request_data)}
                          </TabsContent>
                        )}
                        {log.response_data && (
                          <TabsContent value="response" className="py-2">
                            <p className="text-xs font-semibold">Response Data</p>
                            {renderJson(log.response_data)}
                          </TabsContent>
                        )}
                        {log.stack_trace && (
                          <TabsContent value="stack" className="py-2">
                            <p className="text-xs font-semibold">Stack Trace</p>
                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                              {log.stack_trace}
                            </pre>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logCount} logs
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={logs.length === 0}
          onClick={() => setExpandedLogs({})}
        >
          Collapse All
        </Button>
      </CardFooter>
    </Card>
  );
}
