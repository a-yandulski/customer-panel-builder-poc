import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Shield,
  CreditCard,
  HeadphonesIcon,
  AlertTriangle,
  Server,
  Globe,
  Settings,
  Save,
  RefreshCw,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Clock,
  Calendar,
} from 'lucide-react';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'security',
    name: 'Security Alerts',
    description: 'Login attempts, password changes, suspicious activity',
    icon: <Shield className="h-5 w-5 text-red-600" />,
    channels: { email: true, push: true, sms: true },
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    description: 'Invoices, payment confirmations, billing issues',
    icon: <CreditCard className="h-5 w-5 text-green-600" />,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'support',
    name: 'Support Tickets',
    description: 'Ticket updates, agent responses, resolution notices',
    icon: <HeadphonesIcon className="h-5 w-5 text-blue-600" />,
    channels: { email: true, push: false, sms: false },
  },
  {
    id: 'domain',
    name: 'Domain Management',
    description: 'Domain renewals, DNS changes, transfer updates',
    icon: <Globe className="h-5 w-5 text-purple-600" />,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'system',
    name: 'System Notifications',
    description: 'Maintenance alerts, service updates, outages',
    icon: <Server className="h-5 w-5 text-orange-600" />,
    channels: { email: true, push: true, sms: false },
  },
  {
    id: 'marketing',
    name: 'Marketing & Promotions',
    description: 'Product updates, special offers, newsletters',
    icon: <MessageSquare className="h-5 w-5 text-pink-600" />,
    channels: { email: false, push: false, sms: false },
  },
];

const QUIET_HOURS_PRESETS = [
  { label: 'Never', value: 'never' },
  { label: 'Evenings (6 PM - 8 AM)', value: 'evening' },
  { label: 'Nights (10 PM - 7 AM)', value: 'night' },
  { label: 'Weekends', value: 'weekend' },
  { label: 'Custom', value: 'custom' },
];

export default function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<NotificationCategory[]>(NOTIFICATION_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Advanced settings
  const [emailDigest, setEmailDigest] = useState('daily');
  const [quietHours, setQuietHours] = useState('night');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [groupSimilar, setGroupSimilar] = useState(true);
  const [maxNotifications, setMaxNotifications] = useState('50');

  // Load preferences from context
  useEffect(() => {
    if (preferences) {
      const updatedCategories = NOTIFICATION_CATEGORIES.map(category => ({
        ...category,
        channels: {
          email: preferences.email?.[category.id] ?? category.channels.email,
          push: preferences.push?.[category.id] ?? category.channels.push,
          sms: preferences.sms?.[category.id] ?? category.channels.sms,
        },
      }));
      setLocalPreferences(updatedCategories);
    }
  }, [preferences]);

  const handleChannelToggle = (categoryId: string, channel: 'email' | 'push' | 'sms', enabled: boolean) => {
    setLocalPreferences(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, channels: { ...category.channels, [channel]: enabled } }
          : category
      )
    );
    setHasChanges(true);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const preferencesData = {
        email: {},
        push: {},
        sms: {},
      };

      localPreferences.forEach(category => {
        preferencesData.email[category.id] = category.channels.email;
        preferencesData.push[category.id] = category.channels.push;
        preferencesData.sms[category.id] = category.channels.sms;
      });

      await updatePreferences(preferencesData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableAll = (channel: 'email' | 'push' | 'sms') => {
    setLocalPreferences(prev => 
      prev.map(category => ({ 
        ...category, 
        channels: { ...category.channels, [channel]: true } 
      }))
    );
    setHasChanges(true);
  };

  const handleDisableAll = (channel: 'email' | 'push' | 'sms') => {
    setLocalPreferences(prev => 
      prev.map(category => ({ 
        ...category, 
        channels: { ...category.channels, [channel]: false } 
      }))
    );
    setHasChanges(true);
  };

  const getChannelStats = (channel: 'email' | 'push' | 'sms') => {
    const enabled = localPreferences.filter(cat => cat.channels[channel]).length;
    const total = localPreferences.length;
    return { enabled, total };
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setBrowserNotifications(permission === 'granted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose how and when you want to receive notifications
          </p>
        </div>
        
        {hasChanges && (
          <Button 
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Browser Notifications Permission */}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900">Enable Browser Notifications</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Allow browser notifications to receive real-time updates even when this page isn't open.
                </p>
                <Button
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Settings</CardTitle>
          <CardDescription>
            Common notification preferences for a better experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-green-600" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <Label className="font-medium">Sound Notifications</Label>
                  <p className="text-xs text-gray-600">Play sound for new notifications</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <Label className="font-medium">Browser Notifications</Label>
                  <p className="text-xs text-gray-600">Show desktop notifications</p>
                </div>
              </div>
              <Switch
                checked={browserNotifications}
                onCheckedChange={setBrowserNotifications}
                disabled={Notification.permission === 'denied'}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <Label className="font-medium">Group Similar</Label>
                  <p className="text-xs text-gray-600">Group related notifications together</p>
                </div>
              </div>
              <Switch
                checked={groupSimilar}
                onCheckedChange={setGroupSimilar}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Moon className="h-5 w-5 text-indigo-600" />
                <div>
                  <Label className="font-medium">Quiet Hours</Label>
                  <p className="text-xs text-gray-600">Reduce notifications during set hours</p>
                </div>
              </div>
              <Select value={quietHours} onValueChange={setQuietHours}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUIET_HOURS_PRESETS.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'email', label: 'Email', icon: Mail, color: 'blue' },
          { key: 'push', label: 'Push', icon: Bell, color: 'green' },
          { key: 'sms', label: 'SMS', icon: MessageSquare, color: 'purple' },
        ].map(({ key, label, icon: Icon, color }) => {
          const stats = getChannelStats(key as 'email' | 'push' | 'sms');
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 text-${color}-600`} />
                    <span className="font-medium">{label}</span>
                  </div>
                  <Badge variant="secondary">
                    {stats.enabled}/{stats.total}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEnableAll(key as 'email' | 'push' | 'sms')}
                    className="flex-1 h-8 text-xs"
                  >
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDisableAll(key as 'email' | 'push' | 'sms')}
                    className="flex-1 h-8 text-xs"
                  >
                    Disable All
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Categories</CardTitle>
          <CardDescription>
            Configure notifications for different types of events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b text-sm font-medium text-gray-600">
              <div className="col-span-6">Category</div>
              <div className="col-span-2 text-center">Email</div>
              <div className="col-span-2 text-center">Push</div>
              <div className="col-span-2 text-center">SMS</div>
            </div>

            {/* Category Rows */}
            {localPreferences.map((category) => (
              <div key={category.id} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 last:border-b-0">
                <div className="col-span-6">
                  <div className="flex items-start space-x-3">
                    {category.icon}
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={category.channels.email}
                    onCheckedChange={(checked) => handleChannelToggle(category.id, 'email', checked)}
                    aria-label={`Email notifications for ${category.name}`}
                  />
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={category.channels.push}
                    onCheckedChange={(checked) => handleChannelToggle(category.id, 'push', checked)}
                    aria-label={`Push notifications for ${category.name}`}
                  />
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={category.channels.sms}
                    onCheckedChange={(checked) => handleChannelToggle(category.id, 'sms', checked)}
                    aria-label={`SMS notifications for ${category.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Settings</CardTitle>
          <CardDescription>
            Fine-tune your notification experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email-digest">Email Digest Frequency</Label>
              <Select value={emailDigest} onValueChange={setEmailDigest}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                How often to receive email summaries of your notifications
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-notifications">Maximum Notifications</Label>
              <Select value={maxNotifications} onValueChange={setMaxNotifications}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 notifications</SelectItem>
                  <SelectItem value="25">25 notifications</SelectItem>
                  <SelectItem value="50">50 notifications</SelectItem>
                  <SelectItem value="100">100 notifications</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                Maximum number of notifications to keep in your inbox
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Custom Quiet Hours</h4>
            {quietHours === 'custom' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue="22:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue="07:00"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Days</Label>
                  <div className="flex space-x-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <label key={day} className="flex items-center space-x-1">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-xs">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
