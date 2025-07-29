import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Globe,
  Server,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  FileText,
  Settings,
  X,
  Wallet,
  LifeBuoy,
} from "lucide-react";

export default function Dashboard() {
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [renewalToggles, setRenewalToggles] = useState({
    "example.com": true,
    "mysite.org": false,
    "business.net": true,
  });

  const handleRenewalToggle = (domain: string) => {
    setRenewalToggles(prev => ({
      ...prev,
      [domain]: !prev[domain as keyof typeof prev]
    }));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Personalized Welcome Section */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-gray-200">
          <h1 className="h1 text-gray-900 mb-2">Welcome back, John!</h1>
          <p className="body-large text-gray-700">
            Great to see you again. Here's what's happening with your services today.
          </p>
        </div>

        {/* Promotional Banner */}
        {showPromoBanner && (
          <Card className="bg-gradient-to-r from-primary to-secondary text-white shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">🎉 Special Offer: 25% off new domain registrations!</h3>
                  <p className="text-white/90 body-sm">Valid until December 31st. Use code WINTER25</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="bg-white text-primary hover:bg-white/90">
                  Register Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowPromoBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Summary Cards - 4-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                Active Domains
              </CardTitle>
              <Globe className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="body-sm text-gray-500 mt-1">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                Active Subscriptions
              </CardTitle>
              <Server className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="body-sm text-gray-500 mt-1">All services running</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                Support Tickets
              </CardTitle>
              <MessageCircle className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">2</div>
                <div className="flex space-x-1">
                  <Badge variant="destructive" className="text-xs">1 Open</Badge>
                  <Badge variant="secondary" className="text-xs">1 Pending</Badge>
                </div>
              </div>
              <p className="body-sm text-gray-500 mt-1">Last updated 2 hours ago</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                Account Credit
              </CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$127.50</div>
              <p className="body-sm text-success mt-1">Available balance</p>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Layout: Main Content (70%) + Sidebar (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-7 space-y-6">
            {/* Upcoming Renewals Widget */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Renewals
                </CardTitle>
                <CardDescription className="body-sm">
                  Services requiring renewal in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      domain: "example.com",
                      type: "Domain Registration",
                      expires: "Dec 15, 2024",
                      urgent: true,
                      price: "$12.99",
                    },
                    {
                      domain: "mysite.org",
                      type: "Web Hosting",
                      expires: "Dec 22, 2024",
                      urgent: false,
                      price: "$89.99",
                    },
                    {
                      domain: "business.net",
                      type: "SSL Certificate",
                      expires: "Jan 5, 2025",
                      urgent: false,
                      price: "$49.99",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.domain}</h4>
                          <Badge
                            variant={item.urgent ? "destructive" : "secondary"}
                            className="body-sm"
                          >
                            {item.urgent ? "⚠️ Urgent" : "📅 Upcoming"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between body-sm text-gray-600">
                          <span>{item.type}</span>
                          <span>Expires: {item.expires}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3">
                            <span className="body-sm text-gray-700">Auto-renew:</span>
                            <Switch
                              checked={renewalToggles[item.domain as keyof typeof renewalToggles]}
                              onCheckedChange={() => handleRenewalToggle(item.domain)}
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-900">{item.price}</span>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              Renew Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Renewals
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription className="body-sm">
                  Latest updates and changes to your services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Domain renewed successfully",
                      target: "example.com",
                      time: "2 hours ago",
                      type: "success",
                      icon: Globe,
                    },
                    {
                      action: "SSL certificate installed",
                      target: "mysite.org",
                      time: "1 day ago",
                      type: "success",
                      icon: Settings,
                    },
                    {
                      action: "Support ticket created",
                      target: "#12345 - Email configuration help",
                      time: "3 days ago",
                      type: "info",
                      icon: MessageCircle,
                    },
                    {
                      action: "DNS settings updated",
                      target: "business.net",
                      time: "1 week ago",
                      type: "info",
                      icon: Settings,
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className={`p-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-success/10 text-success"
                          : "bg-primary/10 text-primary"
                      }`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="body-sm text-gray-600 truncate">{activity.target}</p>
                      </div>
                      <span className="body-sm text-gray-500 whitespace-nowrap">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 30% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions Section */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="body-sm">
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                  <Globe className="mr-2 h-4 w-4" />
                  Register New Domain
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage DNS
                </Button>
              </CardContent>
            </Card>

            {/* System Status Widget */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription className="body-sm">
                  Current service health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-700">Domain Services</span>
                  <Badge variant="default" className="bg-success text-white">
                    ✓ Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-700">Web Hosting</span>
                  <Badge variant="default" className="bg-success text-white">
                    ✓ Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-700">Email Services</span>
                  <Badge variant="secondary" className="bg-warning text-white">
                    ⚠️ Maintenance
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-700">Support System</span>
                  <Badge variant="default" className="bg-success text-white">
                    ✓ Operational
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Status Page
                </Button>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription className="body-sm">
                  Your account at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="body-sm text-gray-700">Member since</span>
                    <span className="body-sm font-medium">Jan 2022</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-sm text-gray-700">Account type</span>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-sm text-gray-700">Next invoice</span>
                    <span className="body-sm font-medium">Dec 15, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-sm text-gray-700">Auto-pay</span>
                    <Badge variant="default" className="bg-success text-white">
                      ✓ Enabled
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Manage Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
