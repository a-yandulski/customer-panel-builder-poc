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
import {
  Calendar,
  Globe,
  Server,
  CreditCard,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Dashboard</h1>
            <p className="body text-gray-600 mt-1">
              Welcome back, John! Here's an overview of your services.
            </p>
          </div>
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Globe className="mr-2 h-4 w-4" />
            Register Domain
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Domains
              </CardTitle>
              <Globe className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-xs text-gray-500 mt-1">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hosting Services
              </CardTitle>
              <Server className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-xs text-gray-500 mt-1">All services running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Monthly Spend
              </CardTitle>
              <CreditCard className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$247</div>
              <p className="text-xs text-gray-500 mt-1">-12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Support Tickets
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <p className="text-xs text-gray-500 mt-1">1 open, 1 pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Renewals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-brand-primary" />
                Upcoming Renewals
              </CardTitle>
              <CardDescription>
                Services requiring renewal in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    domain: "example.com",
                    type: "Domain",
                    expires: "Dec 15, 2024",
                    urgent: true,
                  },
                  {
                    domain: "mysite.org",
                    type: "Hosting",
                    expires: "Dec 22, 2024",
                    urgent: false,
                  },
                  {
                    domain: "business.net",
                    type: "SSL Certificate",
                    expires: "Jan 5, 2025",
                    urgent: false,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.domain}
                      </div>
                      <div className="text-sm text-gray-500">{item.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        {item.expires}
                      </div>
                      <Badge
                        variant={item.urgent ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {item.urgent ? "Urgent" : "Upcoming"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Renewals
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Register New Domain
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Server className="mr-2 h-4 w-4" />
                Upgrade Hosting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                View Billing
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Create Support Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes to your services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Domain renewed",
                  target: "example.com",
                  time: "2 hours ago",
                  type: "success",
                },
                {
                  action: "SSL certificate installed",
                  target: "mysite.org",
                  time: "1 day ago",
                  type: "success",
                },
                {
                  action: "Support ticket created",
                  target: "#12345",
                  time: "3 days ago",
                  type: "info",
                },
                {
                  action: "DNS settings updated",
                  target: "business.net",
                  time: "1 week ago",
                  type: "info",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-success"
                        : "bg-brand-primary"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {activity.action}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.target}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
