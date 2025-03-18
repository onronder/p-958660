
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface LogHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  totalLogs: number;
  displayedLogs: number;
}

export function LogHeader({ isLoading, onRefresh, totalLogs, displayedLogs }: LogHeaderProps) {
  return (
    <>
      <CardTitle className="flex justify-between items-center">
        <span>Development Logs</span>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardTitle>
      <CardDescription>
        Viewing {displayedLogs} of {totalLogs} logs. Use these logs to debug API calls and application errors.
      </CardDescription>
    </>
  );
}
