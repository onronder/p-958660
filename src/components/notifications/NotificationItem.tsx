
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { getIconForSeverity, getBackgroundForSeverity } from "./NotificationUtils";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
        getBackgroundForSeverity(notification.severity, notification.read)
      }`}
      onClick={() => onClick(notification)}
    >
      {getIconForSeverity(notification.severity)}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {notification.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {notification.category}
          </Badge>
          {notification.link && (
            <span className="text-xs text-primary">View details</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
