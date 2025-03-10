
import React from "react";
import { Info } from "lucide-react";
import { Notification } from "@/types/notification";
import { formatDistanceToNow, format } from "date-fns";
import { getIconForSeverity, getBackgroundForSeverity } from "./NotificationUtils";
import { Badge } from "@/components/ui/badge";

interface NotificationsListProps {
  isLoading: boolean;
  filteredNotifications: Notification[];
  groupedNotifications: { [key: string]: Notification[] };
  handleNotificationClick: (notification: Notification) => void;
  activeTab: string;
  filter: string;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  isLoading,
  filteredNotifications,
  groupedNotifications,
  handleNotificationClick,
  activeTab,
  filter,
}) => {
  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Loading notifications...</p>
      </div>
    );
  } 
  
  if (filteredNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <Info className="mb-2 h-12 w-12 opacity-20" />
        <p className="text-lg font-medium">No notifications found</p>
        <p className="text-sm">
          {activeTab === "unread"
            ? "You've read all your notifications."
            : filter !== "all"
              ? `No ${filter} notifications found.`
              : "You don't have any notifications yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedNotifications).map(([date, items]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString() === date 
              ? "Today" 
              : new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString() === date
                ? "Yesterday"
                : format(new Date(date), "PPPP")}
          </h3>
          <div className="space-y-3">
            {items.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  getBackgroundForSeverity(notification.severity, notification.read)
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {getIconForSeverity(notification.severity)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {notification.category}
                    </Badge>
                    {!notification.read && (
                      <Badge>Unread</Badge>
                    )}
                    {notification.link && (
                      <span className="text-sm text-primary">View details</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
