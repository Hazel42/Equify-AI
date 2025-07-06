
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NotificationCenter = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: "AI Recommendation Ready",
      message: "New suggestions for Sarah available",
      time: "5m ago",
      read: false
    },
    {
      id: 2,
      title: "Relationship Reminder",
      message: "Haven't connected with Mike in 2 weeks",
      time: "1h ago",
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuHeader className="font-semibold">
          Notifications
        </DropdownMenuHeader>
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-center text-gray-500">
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
              <div className="flex justify-between w-full items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                </div>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
