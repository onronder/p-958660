
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/types/notification";
import { 
  fetchNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead 
} from "@/services/notificationService";
import NotificationHeader from "./notifications/NotificationHeader";
import NotificationGroups from "./notifications/NotificationGroups";

interface NotificationSidebarProps {
  children?: React.ReactNode;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const handleReadAll = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(
        notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <NotificationHeader 
          unreadCount={unreadCount} 
          onReadAll={handleReadAll} 
        />
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <NotificationGroups 
            notifications={notifications} 
            onNotificationClick={handleNotificationClick} 
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSidebar;
