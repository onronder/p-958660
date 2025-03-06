
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface NotificationHeaderProps {
  unreadCount: number;
  onReadAll: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ 
  unreadCount, 
  onReadAll 
}) => {
  const navigate = useNavigate();

  return (
    <>
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
            <Button onClick={onReadAll} variant="ghost" size="sm">
              Mark all as read
            </Button>
          )}
          <Button onClick={() => navigate("/notifications")} variant="outline" size="sm">
            View all
          </Button>
        </div>
      </SheetHeader>
      
      <Separator className="my-4" />
    </>
  );
};

export default NotificationHeader;
