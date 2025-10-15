import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Check } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { ScrollArea } from "./ui/scroll-area";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-72">
          {notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <Link
                  to={notification.link || "#"}
                  key={notification.id}
                  className={cn(
                    "block p-2 rounded-md hover:bg-accent",
                    !notification.read && "bg-blue-50 dark:bg-blue-900/20",
                  )}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-8">
              You have no new notifications.
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};