import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  category: string;
  priority: "low" | "medium" | "high";
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    onlyUnread?: boolean;
  }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // WebSocket simulation
  isConnected: boolean;
  reconnect: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (toastId: string) => void;

  // Preferences
  preferences: Record<string, any> | null;
  updatePreferences: (preferences: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Mock token function (replace with actual auth)
const getAuthToken = () => {
  return localStorage.getItem("fake_auth_token") || "mock-token";
};

// WebSocket simulation for real-time notifications
class MockWebSocket {
  private callbacks: ((notification: Notification) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isConnectedState = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect() {
    this.isConnectedState = true;
    this.reconnectAttempts = 0;

    // Simulate receiving notifications every 30-60 seconds
    this.intervalId = setInterval(
      () => {
        if (Math.random() > 0.7) {
          // 30% chance of receiving a notification
          this.simulateNotification();
        }
      },
      30000 + Math.random() * 30000,
    ); // 30-60 seconds

    // Simulate connection issues
    setTimeout(
      () => {
        if (Math.random() > 0.9) {
          // 10% chance of connection issues
          this.disconnect();
          this.attemptReconnect();
        }
      },
      5000 + Math.random() * 10000,
    ); // 5-15 seconds
  }

  disconnect() {
    this.isConnectedState = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        this.connect();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  onNotification(callback: (notification: Notification) => void) {
    this.callbacks.push(callback);
  }

  get isConnected() {
    return this.isConnectedState;
  }

  private simulateNotification() {
    const mockNotifications = [
      {
        title: "New support reply",
        message: "Your support ticket has been updated with a new response.",
        type: "info" as const,
        category: "support",
        priority: "medium" as const,
        actionUrl: "/support",
      },
      {
        title: "Payment processed",
        message: "Your payment has been successfully processed.",
        type: "success" as const,
        category: "billing",
        priority: "low" as const,
        actionUrl: "/billing",
      },
      {
        title: "Domain expiring soon",
        message:
          "Your domain will expire in 7 days. Renew now to avoid interruption.",
        type: "warning" as const,
        category: "domain",
        priority: "high" as const,
        actionUrl: "/billing",
      },
      {
        title: "Security alert",
        message: "Unusual login activity detected on your account.",
        type: "error" as const,
        category: "security",
        priority: "high" as const,
        actionUrl: "/account",
      },
      {
        title: "System maintenance",
        message: "Scheduled maintenance will begin in 1 hour.",
        type: "warning" as const,
        category: "system",
        priority: "medium" as const,
        actionUrl: "/dashboard",
      },
    ];

    const randomNotification =
      mockNotifications[Math.floor(Math.random() * mockNotifications.length)];

    const notification: Notification = {
      id: `notif_${Date.now()}`,
      title: randomNotification.title,
      message: randomNotification.message,
      type: randomNotification.type,
      category: randomNotification.category,
      priority: randomNotification.priority,
      isRead: false,
      timestamp: new Date().toISOString(),
      actionUrl: randomNotification.actionUrl,
      metadata: {
        source: "websocket",
        generated: true,
      },
    };

    this.callbacks.forEach((callback) => callback(notification));
  }
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [preferences, setPreferences] = useState<Record<string, any> | null>(
    null,
  );

  const wsRef = useRef<MockWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket simulation
  useEffect(() => {
    wsRef.current = new MockWebSocket();

    wsRef.current.onNotification((notification) => {
      // Add new notification to the list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast for real-time notifications
      showToast({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        duration: 5000,
        action: notification.actionUrl
          ? {
              label: "View",
              onClick: () => (window.location.href = notification.actionUrl!),
            }
          : undefined,
      });
    });

    wsRef.current.connect();
    setIsConnected(true);

    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      if (wsRef.current) {
        setIsConnected(wsRef.current.isConnected);
      }
    }, 1000);

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      clearInterval(connectionCheckInterval);
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
        category?: string;
        onlyUnread?: boolean;
      } = {},
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.category) queryParams.append("category", params.category);
        if (params.onlyUnread) queryParams.append("onlyUnread", "true");

        const response = await fetch(`/api/notifications?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          let errorMessage = "Failed to fetch notifications";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If we can't parse the error response, use the default message
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (params.page && params.page > 1) {
          // Append to existing notifications for pagination
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          // Replace notifications for initial load or refresh
          setNotifications(data.notifications);
        }

        setUnreadCount(data.unreadCount);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch notifications";
        setError(errorMessage);
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unreadCount", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch unread count");
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark notification as read",
        );
      }

      const data = await response.json();

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      showToast({
        message: "Failed to mark notification as read",
        type: "error",
        duration: 3000,
      });
    }
  }, []);

  // Mark notification as unread
  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/unread`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark notification as unread",
        );
      }

      const data = await response.json();

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: false }
            : notification,
        ),
      );
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to mark notification as unread:", err);
      showToast({
        message: "Failed to mark notification as unread",
        type: "error",
        duration: 3000,
      });
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark all notifications as read",
        );
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );
      setUnreadCount(0);

      showToast({
        message: "All notifications marked as read",
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      showToast({
        message: "Failed to mark all notifications as read",
        type: "error",
        duration: 3000,
      });
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete notification");
      }

      const data = await response.json();

      // Update local state
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId),
      );
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      showToast({
        message: "Failed to delete notification",
        type: "error",
        duration: 3000,
      });
    }
  }, []);

  // WebSocket reconnection
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.reconnect();
      setIsConnected(true);
    }
  }, []);

  // Toast management
  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss toast
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: any) => {
      try {
        const response = await fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preferences: newPreferences }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update preferences");
        }

        const data = await response.json();
        setPreferences(data.preferences);

        showToast({
          message: "Notification preferences updated",
          type: "success",
          duration: 3000,
        });
      } catch (err) {
        console.error("Failed to update preferences:", err);
        showToast({
          message: "Failed to update notification preferences",
          type: "error",
          duration: 3000,
        });
      }
    },
    [showToast],
  );

  // Initial data load with delay for MSW to be ready
  useEffect(() => {
    // Add a small delay to ensure MSW is fully initialized
    const timer = setTimeout(() => {
      fetchNotifications();
      fetchUnreadCount();

      // Fetch preferences
      fetch("/api/notifications/preferences", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => data && setPreferences(data.preferences))
        .catch((err) => console.error("Failed to fetch preferences:", err));
    }, 1000); // 1 second delay to allow MSW to initialize

    return () => clearTimeout(timer);
  }, [fetchNotifications, fetchUnreadCount]);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
      localStorage.setItem("unreadCount", unreadCount.toString());
    } catch (err) {
      console.error("Failed to persist notifications:", err);
    }
  }, [notifications, unreadCount]);

  // Load persisted notifications on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("notifications");
      const savedUnreadCount = localStorage.getItem("unreadCount");

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      if (savedUnreadCount) {
        setUnreadCount(parseInt(savedUnreadCount, 10));
      }
    } catch (err) {
      console.error("Failed to load persisted notifications:", err);
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    isConnected,
    reconnect,
    toasts,
    showToast,
    dismissToast,
    preferences,
    updatePreferences,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

// Hook for toast notifications only
export function useToast() {
  try {
    const { showToast, dismissToast, toasts } = useNotifications();
    return { showToast, dismissToast, toasts };
  } catch (error) {
    // Fallback if context is not available
    console.warn('useToast: NotificationContext not available, using fallbacks');
    return {
      showToast: () => {},
      dismissToast: () => {},
      toasts: [] as Toast[]
    };
  }
}
