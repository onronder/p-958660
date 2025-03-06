
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { Notification } from "@/types/notification";

export const getIconForSeverity = (severity: string) => {
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

export const getBackgroundForSeverity = (severity: string, read: boolean) => {
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

export const groupNotificationsByDate = (notifications: Notification[]) => {
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
