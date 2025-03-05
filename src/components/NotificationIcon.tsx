
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countUnreadNotifications } from "@/services/notificationService";

interface NotificationIconProps {
  onClick: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await countUnreadNotifications();
      setUnreadCount(count);
    };

    fetchUnreadCount();

    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className="relative"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationIcon;
