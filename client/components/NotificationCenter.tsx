import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Clock,
  CreditCard,
  Shield,
  Server,
  MessageCircle,
  CheckCircle,
  ExternalLink,
  Check as MarkAsRead,
} from "lucide-react";

type NotificationType =
  | "service"
  | "billing"
  | "support"
  | "security"
  | "maintenance";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: "low" | "normal" | "high" | "urgent";
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "service",
      title: "Domain Renewal Due Soon",
      message:
        "Your domain example.com expires in 7 days. Renew now to avoid service interruption.",
      timestamp: "2 hours ago",
      isRead: false,
      actionUrl: "/services",
      priority: "high",
    },
    {
      id: "2",
      type: "support",
      title: "Support Ticket Updated",
      message:
        "Your ticket #TKT-2024-001 has been updated by our support team.",
      timestamp: "4 hours ago",
      isRead: false,
      actionUrl: "/support",
      priority: "normal",
    },
    {
      id: "3",
      type: "billing",
      title: "Payment Successful",
      message:
        "Your payment of $47.00 for hosting services has been processed successfully.",
      timestamp: "1 day ago",
      isRead: true,
      actionUrl: "/billing",
      priority: "normal",
    },
    {
      id: "4",
      type: "security",
      title: "New Login Detected",
      message:
        "A new login to your account was detected from New York, NY. If this wasn't you, please secure your account.",
      timestamp: "2 days ago",
      isRead: false,
      actionUrl: "/account",
      priority: "urgent",
    },
    {
      id: "5",
      type: "maintenance",
      title: "Scheduled Maintenance",
      message:
        "Server maintenance is scheduled for tonight from 2:00 AM to 4:00 AM EST.",
      timestamp: "3 days ago",
      isRead: true,
      priority: "low",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "service":
        return <Clock className="h-4 w-4 text-primary" />;
      case "billing":
        return <CreditCard className="h-4 w-4 text-success" />;
      case "support":
        return <MessageCircle className="h-4 w-4 text-info" />;
      case "security":
        return <Shield className="h-4 w-4 text-error" />;
      case "maintenance":
        return <Server className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-error";
      case "high":
        return "border-l-warning";
      case "normal":
        return "border-l-primary";
      case "low":
        return "border-l-gray-300";
      default:
        return "border-l-gray-300";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const categoryNotifications = notifications.reduce(
    (acc, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = [];
      }
      acc[notification.type].push(notification);
      return acc;
    },
    {} as Record<NotificationType, Notification[]>,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center text-sm">
            View All Notifications
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
