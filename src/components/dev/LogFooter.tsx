
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface LogFooterProps {
  displayedLogs: number;
  totalLogs: number;
  onCollapseAll: () => void;
  hasLogs: boolean;
}

export function LogFooter({ displayedLogs, totalLogs, onCollapseAll, hasLogs }: LogFooterProps) {
  return (
    <CardFooter className="border-t pt-4 flex justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {displayedLogs} of {totalLogs} logs
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        disabled={!hasLogs}
        onClick={onCollapseAll}
      >
        Collapse All
      </Button>
    </CardFooter>
  );
}
