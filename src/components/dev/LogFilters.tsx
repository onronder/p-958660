
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LogFiltersProps {
  onSearch: (term: string) => void;
  isLoggingEnabled: boolean;
  isPersistenceEnabled?: boolean;
  onToggleLogging: (enabled: boolean) => void;
  onTogglePersistence?: (enabled: boolean) => void;
}

export function LogFilters({ 
  onSearch, 
  isLoggingEnabled, 
  isPersistenceEnabled = true,
  onToggleLogging,
  onTogglePersistence
}: LogFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="space-y-4 my-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-1/2">
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center space-x-2">
            <Switch 
              id="logging-toggle" 
              checked={isLoggingEnabled}
              onCheckedChange={onToggleLogging}
            />
            <Label htmlFor="logging-toggle">Enable Logging</Label>
          </div>
          
          {onTogglePersistence && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="persistence-toggle" 
                checked={isPersistenceEnabled}
                onCheckedChange={onTogglePersistence}
              />
              <Label htmlFor="persistence-toggle">Persist Logs</Label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
