
import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Notification } from "@/types/notification";
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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

  const getIconForSeverity = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundForSeverity = (severity: string, read: boolean) => {
    if (read) return "";
    
    switch (severity) {
      case "success":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      default:
        return "bg-blue-50";
    }
  };

  const groupNotificationsByDate = () => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate();

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
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2">{unreadCount} unread</Badge>
            )}
          </SheetTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button onClick={handleReadAll} variant="ghost" size="sm">
                Mark all as read
              </Button>
            )}
            <Button onClick={() => navigate("/notifications")} variant="outline" size="sm">
              View all
            </Button>
          </div>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="mb-2 h-12 w-12 opacity-20" />
              <p>No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
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
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors ${
                          getBackgroundForSeverity(notification.severity, notification.read)
                        }`}
                        onClick={() => handleNotificationClick(notification)}
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSidebar;
