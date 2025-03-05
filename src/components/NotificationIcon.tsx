
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { countUnreadNotifications } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NotificationIcon: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await countUnreadNotifications();
      setUnreadCount(count);
    };

    fetchUnreadCount();
    
    // Refresh count every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative" 
      onClick={() => navigate("/notifications")}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationIcon;
