import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bell,
  Search,
  Filter,
  MarkEmailRead,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Tag,
  ExternalLink,
  Clock,
  MoreHorizontal,
  Archive,
  Star,
  StarOff,
} from 'lucide-react';

const NOTIFICATION_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'security', label: 'Security' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
  { value: 'domain', label: 'Domains' },
  { value: 'technical', label: 'Technical' },
  { value: 'system', label: 'System' },
];

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Information' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

interface NotificationCardProps {
  notification: any;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (url: string) => void;
}

function NotificationCard({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onNavigate,
}: NotificationCardProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
      <Badge className={`text-xs ${colors[notification.priority as keyof typeof colors]}`}>
        {notification.priority}
      </Badge>
    );
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
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
    <Card 
      className={`
        transition-all duration-200 cursor-pointer hover:shadow-md
        ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(notification.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
            aria-label={`Select notification: ${notification.title}`}
          />
          
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${
                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                  {!notification.isRead && (
                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block" />
                  )}
                </h3>
                
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  {notification.message}
                </p>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(notification.timestamp)}
                  </span>
                  
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                  
                  {getPriorityBadge()}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.isRead 
                      ? onMarkAsUnread(notification.id)
                      : onMarkAsRead(notification.id);
                  }}
                  className="h-8 w-8 p-0"
                  aria-label={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  <MarkEmailRead className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState('all');

  // Load notifications on mount and when filters change
  useEffect(() => {
    const params: any = { page: 1, limit: 50 };
    
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (showUnreadOnly) params.onlyUnread = true;
    
    fetchNotifications(params);
  }, [selectedCategory, showUnreadOnly, fetchNotifications]);

  // Filter notifications based on search and type
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    
    const matchesTab = currentTab === 'all' || 
      (currentTab === 'unread' && !notification.isRead) ||
      (currentTab === 'read' && notification.isRead);
    
    return matchesSearch && matchesType && matchesTab;
  });

  const handleSelectNotification = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedNotifications);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        markAsRead(id);
      }
    });
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications(new Set());
  };

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="mr-3 h-6 w-6" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your notifications and stay updated with important events
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {unreadCount} unread
              </Badge>
            )}
            
            <Button
              variant="outline"
              onClick={() => fetchNotifications()}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/account?tab=privacy')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unread-only"
                    checked={showUnreadOnly}
                    onCheckedChange={setShowUnreadOnly}
                  />
                  <label htmlFor="unread-only" className="text-sm">
                    Unread only
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkMarkAsRead}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <MarkEmailRead className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedNotifications(new Set())}
                    className="text-blue-700 hover:bg-blue-100"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="space-y-4">
            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all notifications"
                />
                <span className="text-sm text-gray-600">
                  Select all ({filteredNotifications.length} notifications)
                </span>
              </div>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <MarkEmailRead className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchNotifications()}
                      className="ml-auto text-red-600 hover:bg-red-100"
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications List */}
            {isLoading && notifications.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading notifications</h3>
                <p className="text-gray-600">Please wait while we fetch your notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'We\'ll notify you when something important happens.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedNotifications.has(notification.id)}
                    onSelect={handleSelectNotification}
                    onMarkAsRead={markAsRead}
                    onMarkAsUnread={markAsUnread}
                    onDelete={deleteNotification}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
