
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Notification } from "@/types/notification";
import { 
  fetchNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead, 
  deleteOldNotifications 
} from "@/services/notificationService";
import { useNavigate } from "react-router-dom";
import { groupNotificationsByDate } from "@/components/notifications/NotificationUtils";
import NotificationsPageHeader from "@/components/notifications/NotificationsPageHeader";
import NotificationsFilters from "@/components/notifications/NotificationsFilters";
import NotificationsList from "@/components/notifications/NotificationsList";

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
      <NotificationsPageHeader 
        unreadCount={unreadCount} 
        handleReadAll={handleReadAll} 
        handleRemoveOld={handleRemoveOld}
      />

      <Card>
        <div className="p-6">
          <NotificationsFilters 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filter={filter}
            setFilter={setFilter}
            unreadCount={unreadCount}
          />
          
          <Separator className="my-4" />
          
          <NotificationsList 
            isLoading={isLoading}
            filteredNotifications={filteredNotifications}
            groupedNotifications={groupedNotifications}
            handleNotificationClick={handleNotificationClick}
            activeTab={activeTab}
            filter={filter}
          />
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
