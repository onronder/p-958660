
import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types/notification";
import { 
  fetchNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead, 
  deleteOldNotifications 
} from "@/services/notificationService";
import { formatDistanceToNow, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    // Cleanup old notifications on page load
    deleteOldNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await fetchNotifications();
    setNotifications(data);
    setIsLoading(false);
  };

  const handleReadAll = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(
        notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleRemoveOld = async () => {
    if (await deleteOldNotifications(7)) {
      loadNotifications();
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

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifs.forEach(notification => {
      const date = new Date(notification.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread" && notification.read) {
      return false;
    }
    
    if (filter !== "all" && notification.category !== filter) {
      return false;
    }
    
    return true;
  });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
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

      <Card>
        <div className="p-6">
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
          
          <Separator className="my-4" />
          
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
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
          ) : (
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
          )}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
