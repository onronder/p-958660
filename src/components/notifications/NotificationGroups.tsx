
import React from "react";
import { Bell } from "lucide-react";
import { Notification } from "@/types/notification";
import NotificationItem from "./NotificationItem";
import { groupNotificationsByDate } from "./NotificationUtils";

interface NotificationGroupsProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NotificationGroups: React.FC<NotificationGroupsProps> = ({ 
  notifications, 
  onNotificationClick 
}) => {
  const groupedNotifications = groupNotificationsByDate(notifications);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Bell className="mb-2 h-12 w-12 opacity-20" />
        <p>No notifications</p>
        <p className="text-sm">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedNotifications).map(([date, items]) => (
        <div key={date} className="space-y-2">
          <h3 className="px-1 text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString() === date 
              ? "Today" 
              : new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString() === date
                ? "Yesterday"
                : date}
          </h3>
          <div className="space-y-2">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationGroups;
