import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  MailCheck,
  Settings,
  Trash2,
  ExternalLink,
  Wifi,
  WifiOff,
  RefreshCw,
  MoreHorizontal,
  Clock,
  Filter,
} from 'lucide-react';

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (url: string) => void;
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onMarkAsUnread, 
  onDelete, 
  onNavigate 
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
      default:
        return 'border-l-blue-500';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      onNavigate(notification.actionUrl);
    }
  };

  return (
    <div
      className={`
        relative p-4 border-l-2 hover:bg-gray-50 transition-colors cursor-pointer
        ${getPriorityColor()}
        ${!notification.isRead ? 'bg-blue-50/30' : 'bg-white'}
      `}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Notification: ${notification.title}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium truncate ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeAgo(notification.timestamp)}
                </span>
                
                {notification.category && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 h-5"
                  >
                    {notification.category}
                  </Badge>
                )}
                
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" aria-label="Unread" />
                )}
              </div>
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.isRead 
                      ? onMarkAsUnread(notification.id)
                      : onMarkAsRead(notification.id);
                  }}
                  className="h-6 w-6 p-0"
                  aria-label={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  <MailCheck className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    reconnect,
  } = useNotifications();

  const bellRef = useRef<HTMLButtonElement>(null);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ page: 1, limit: 20 });
    }
  }, [isOpen, fetchNotifications]);

  const handleNavigate = (url: string) => {
    navigate(url);
    setIsOpen(false);
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Animate bell on new notifications
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={bellRef}
          variant="ghost"
          size="sm"
          className={`relative h-10 w-10 p-0 ${isAnimating ? 'animate-bounce' : ''}`}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-gray-700" />
          ) : (
            <Bell className="h-5 w-5 text-gray-700" />
          )}
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs p-0 flex items-center justify-center border-2 border-white"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Connection status indicator */}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-red-500 border border-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0 max-h-[80vh] overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Connection status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className="h-8 w-8 p-0"
              aria-label={isConnected ? 'Connected' : 'Reconnect'}
            >
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </Button>
            
            {/* Filter toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="h-8 w-8 p-0"
              aria-label={`Show ${filter === 'all' ? 'unread only' : 'all notifications'}`}
            >
              <Filter className={`h-4 w-4 ${filter === 'unread' ? 'text-blue-600' : 'text-gray-600'}`} />
            </Button>
            
            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="w-full justify-start h-8"
                  >
                    <MailCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate('/account?tab=privacy');
                      setIsOpen(false);
                    }}
                    className="w-full justify-start h-8"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNotifications()}
                    disabled={isLoading}
                    className="w-full justify-start h-8"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Connection status banner */}
        {!isConnected && (
          <div className="bg-red-50 border-b border-red-200 p-3">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                Connection lost. Real-time updates disabled.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="ml-auto h-6 px-2 text-xs text-red-600 hover:bg-red-100"
              >
                Reconnect
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNotifications()}
                className="ml-auto h-6 px-2 text-xs text-red-600 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Filter info */}
        {filter === 'unread' && (
          <div className="bg-blue-50 border-b border-blue-200 p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-800">
                Showing unread only ({filteredNotifications.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter('all')}
                className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-100"
              >
                Show all
              </Button>
            </div>
          </div>
        )}

        {/* Notifications list */}
        <ScrollArea className="max-h-96">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-gray-300 mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h4>
              <p className="text-sm text-gray-600">
                {filter === 'unread' 
                  ? 'You\'re all caught up!'
                  : 'We\'ll notify you when something happens.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onDelete={deleteNotification}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full justify-center h-8 text-sm"
            >
              View all notifications
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
