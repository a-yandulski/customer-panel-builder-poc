import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ProfileForm from "@/components/account/ProfileForm";
import AddressForm from "@/components/account/AddressForm";
import PasswordChangeForm from "@/components/account/PasswordChangeForm";
import TwoFactorAuth from "@/components/account/TwoFactorAuth";
import { useSecurity } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Shield,
  Activity,
  Bell,
  Settings,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

type ActivityLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  suspicious: boolean;
};

type NotificationPreference = {
  id: string;
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  description: string;
};

export default function Account() {
  const { security, isLoading: securityLoading } = useSecurity();

  // Mock data for activity log and notifications
  const [activityLog] = useState<ActivityLogEntry[]>([
    {
      id: "1",
      action: "Successful login",
      timestamp: "Dec 12, 2024 2:30 PM",
      ipAddress: "192.168.1.100",
      location: "New York, NY, US",
      device: "Desktop",
      browser: "Chrome 120.0",
      suspicious: false,
    },
    {
      id: "2",
      action: "Password changed",
      timestamp: "Dec 10, 2024 9:15 AM",
      ipAddress: "192.168.1.100",
      location: "New York, NY, US",
      device: "Desktop",
      browser: "Chrome 120.0",
      suspicious: false,
    },
    {
      id: "3",
      action: "Login attempt (failed)",
      timestamp: "Dec 8, 2024 11:45 PM",
      ipAddress: "45.123.67.89",
      location: "Unknown Location",
      device: "Mobile",
      browser: "Safari 17.0",
      suspicious: true,
    },
    {
      id: "4",
      action: "Two-factor authentication enabled",
      timestamp: "Dec 5, 2024 3:20 PM",
      ipAddress: "192.168.1.100",
      location: "New York, NY, US",
      device: "Desktop",
      browser: "Chrome 120.0",
      suspicious: false,
    },
  ]);

  const [notificationPreferences, setNotificationPreferences] = useState<
    NotificationPreference[]
  >([
    {
      id: "service",
      category: "Service Updates",
      email: true,
      sms: false,
      push: true,
      description:
        "Domain renewals, hosting updates, maintenance notifications",
    },
    {
      id: "billing",
      category: "Billing & Payments",
      email: true,
      sms: true,
      push: true,
      description: "Invoices, payment confirmations, billing issues",
    },
    {
      id: "security",
      category: "Security Alerts",
      email: true,
      sms: true,
      push: true,
      description: "Login attempts, password changes, suspicious activity",
    },
    {
      id: "marketing",
      category: "Marketing & Promotions",
      email: false,
      sms: false,
      push: false,
      description: "Product updates, special offers, newsletters",
    },
  ]);

  const handleNotificationChange = (
    id: string,
    type: "email" | "sms" | "push",
    value: boolean,
  ) => {
    setNotificationPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, [type]: value } : pref)),
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Account & Security</h1>
            <p className="body text-gray-600 mt-1">
              Manage your profile information, security settings, and privacy preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Shield className="mr-1 h-3 w-3" />
              Account Verified
            </Badge>
            {!securityLoading && security?.securityScore && (
              <Badge 
                className={`${
                  security.securityScore >= 80 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : security.securityScore >= 60
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                Security: {security.securityScore}%
              </Badge>
            )}
          </div>
        </div>

        {/* Account Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileForm />
            <AddressForm />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Overview */}
            {!securityLoading && security && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Security Overview
                  </CardTitle>
                  <CardDescription className="body-sm">
                    Your account security status and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Password Strength</span>
                      </div>
                      <p className={`text-lg font-semibold ${
                        security.passwordStrength === 'strong' ? 'text-green-600' : 
                        security.passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {security.passwordStrength?.charAt(0).toUpperCase() + security.passwordStrength?.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Last changed: {new Date(security.passwordLastChanged).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">2FA Status</span>
                      </div>
                      <p className={`text-lg font-semibold ${
                        security.twoFactorEnabled ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {security.twoFactorEnabled ? 'Enhanced security' : 'Recommended'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Login Sessions</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        {security.loginSessions}
                      </p>
                      <p className="text-sm text-gray-600">Active sessions</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Security Score</span>
                      </div>
                      <p className={`text-lg font-semibold ${
                        security.securityScore >= 80 ? 'text-green-600' : 
                        security.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {security.securityScore}%
                      </p>
                      <p className="text-sm text-gray-600">Overall security</p>
                    </div>
                  </div>

                  {security.suspiciousActivity && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-900">Suspicious Activity Detected</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        We've detected unusual activity on your account. Please review your recent activity and consider changing your password.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <PasswordChangeForm />
            <TwoFactorAuth />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Security Activity Log
                </CardTitle>
                <CardDescription className="body-sm">
                  Monitor login attempts and security-related activities on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border ${
                        entry.suspicious
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-full ${
                              entry.suspicious
                                ? "bg-red-100 text-red-600"
                                : entry.action.includes("failed")
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                            }`}
                          >
                            {entry.device === "Desktop" ? (
                              <Monitor className="h-4 w-4" />
                            ) : (
                              <Smartphone className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {entry.action}
                            </h4>
                            <div className="space-y-1 body-sm text-gray-600">
                              <p>{entry.timestamp}</p>
                              <p>
                                IP: {entry.ipAddress} • {entry.location}
                              </p>
                              <p>
                                {entry.device} • {entry.browser}
                              </p>
                            </div>
                          </div>
                        </div>
                        {entry.suspicious && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Suspicious
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                    View Full Activity Log
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            {/* Notification Preferences */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="body-sm">
                  Choose how you want to receive updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationPreferences.map((pref) => (
                    <div key={pref.id} className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {pref.category}
                        </h4>
                        <p className="body-sm text-gray-600">
                          {pref.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={pref.email}
                            onChange={(e) =>
                              handleNotificationChange(
                                pref.id,
                                "email",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="body-sm">Email</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={pref.sms}
                            onChange={(e) =>
                              handleNotificationChange(
                                pref.id,
                                "sms",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="body-sm">SMS</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={pref.push}
                            onChange={(e) =>
                              handleNotificationChange(
                                pref.id,
                                "push",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="body-sm">Push</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Controls */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  Data & Privacy Controls
                </CardTitle>
                <CardDescription className="body-sm">
                  Manage your personal data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Export Your Data
                      </h4>
                      <p className="body-sm text-gray-600">
                        Download a copy of your account data and activity
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Request Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-red-900">
                        Delete Account
                      </h4>
                      <p className="body-sm text-gray-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50">
                      Delete Account
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
