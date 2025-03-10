
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationsFiltersProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  unreadCount: number;
}

const NotificationsFilters: React.FC<NotificationsFiltersProps> = ({
  activeTab,
  setActiveTab,
  filter,
  setFilter,
  unreadCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
        <TabsList>
          <TabsTrigger value="all">
            All
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="job">Jobs</SelectItem>
          <SelectItem value="transformation">Transformations</SelectItem>
          <SelectItem value="source">Sources</SelectItem>
          <SelectItem value="destination">Destinations</SelectItem>
          <SelectItem value="export">Exports</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NotificationsFilters;
