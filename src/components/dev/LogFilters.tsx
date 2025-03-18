
import React, { useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { debounce } from 'lodash';

interface LogFiltersProps {
  onSearch: (term: string) => void;
  isLoggingEnabled: boolean;
  onToggleLogging: (enabled: boolean) => void;
}

export function LogFilters({ onSearch, isLoggingEnabled, onToggleLogging }: LogFiltersProps) {
  // Handle search with debounce
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  return (
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
            onCheckedChange={onToggleLogging}
          />
          <Label htmlFor="logging-enabled">Logging Enabled</Label>
        </div>
      </div>
    </div>
  );
}
