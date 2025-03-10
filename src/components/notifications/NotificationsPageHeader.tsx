
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash2 } from "lucide-react";

interface NotificationsPageHeaderProps {
  unreadCount: number;
  handleReadAll: () => void;
  handleRemoveOld: () => void;
}

const NotificationsPageHeader: React.FC<NotificationsPageHeaderProps> = ({
  unreadCount,
  handleReadAll,
  handleRemoveOld,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage all your notifications
        </p>
      </div>
      <div className="flex gap-2">
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleReadAll}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleRemoveOld}
        >
          <Trash2 className="h-4 w-4" />
          Clean up old
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPageHeader;
