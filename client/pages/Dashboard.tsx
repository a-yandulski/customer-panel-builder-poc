import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardSkeleton, ServiceCardSkeleton, RenewalTableSkeleton, ActivitySkeleton } from "@/components/dashboard/DashboardSkeleton";
import { 
  ErrorState, 
  ServiceCardError, 
  RenewalTableError, 
  ActivityError, 
  EmptyState,
  NetworkError
} from "@/components/dashboard/DashboardError";
import MobileOptimizedCard from "@/components/MobileOptimizedCard";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RefreshCw,
  Filter,
  SortAsc,
  Clock,
  CheckCircle,
  ExternalLink,
  ArrowUpRight,
  Activity as ActivityIcon,
  Users,
  Shield
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, refetch, isRefreshing } = useDashboard();
  
  // Local state
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [renewalSort, setRenewalSort] = useState("expiry");
  const [renewalFilter, setRenewalFilter] = useState("all");
  const [expandedRenewal, setExpandedRenewal] = useState<string | null>(null);

  // Handle renewal auto-renewal toggle
  const handleRenewalToggle = useCallback(async (renewalId: string) => {
    // In a real app, this would make an API call
    console.log("Toggle auto-renewal for:", renewalId);
    // Optimistically update local state or refetch data
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refetch.all();
  }, [refetch]);

  // Handle renewal sorting
  const handleRenewalSort = useCallback((sortBy: string) => {
    setRenewalSort(sortBy);
    refetch.renewals({ sortBy, window: 30 });
  }, [refetch]);

  // Handle renewal filtering  
  const handleRenewalFilter = useCallback((type: string) => {
    setRenewalFilter(type);
    const filterType = type === "all" ? undefined : type;
    refetch.renewals({ type: filterType, window: 30 });
  }, [refetch]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "domain_renewal": return Globe;
      case "ssl_install": return Shield;
      case "ticket_created": return MessageCircle;
      case "dns_update": return Settings;
      case "payment_received": return CreditCard;
      case "security_alert": return Shield;
      default: return ActivityIcon;
    }
  };

  // Show loading skeleton on initial load
  if (loading.summary && loading.renewals && loading.activities) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Welcome back, {user?.given_name || user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="body sm:body-large text-gray-700 mt-1">
              Great to see you again. Here's what's happening with your services today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
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
                  <h3 className="font-semibold">
                    🎉 Special Offer: 25% off new domain registrations!
                  </h3>
                  <p className="text-white/90 body-sm">
                    Valid until December 31st. Use code WINTER25
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate("/services")}
                >
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

        {/* Service Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading.summary ? (
            [...Array(4)].map((_, i) => <ServiceCardSkeleton key={i} />)
          ) : error.summary ? (
            <div className="col-span-full">
              <ServiceCardError onRetry={refetch.summary} />
            </div>
          ) : (
            <>
              <Card 
                className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/services")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="body-sm font-semibold text-gray-700">
                    Active Domains
                  </CardTitle>
                  <Globe className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.summary?.domains.active || 0}
                  </div>
                  <p className="body-sm text-gray-500 mt-1 flex items-center">
                    {data.summary?.domains.expiring ? (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                        {data.summary.domains.expiring} expiring soon
                      </>
                    ) : (
                      "All domains current"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/services")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="body-sm font-semibold text-gray-700">
                    Active Subscriptions
                  </CardTitle>
                  <Server className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.summary?.subscriptions.active || 0}
                  </div>
                  <p className="body-sm text-gray-500 mt-1">
                    {data.summary?.subscriptions.suspended ? 
                      `${data.summary.subscriptions.suspended} suspended` : 
                      "All services running"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/support")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="body-sm font-semibold text-gray-700">
                    Support Tickets
                  </CardTitle>
                  <MessageCircle className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {data.summary?.tickets.total || 0}
                    </div>
                    <div className="flex space-x-1">
                      {data.summary?.tickets.open > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {data.summary.tickets.open} Open
                        </Badge>
                      )}
                      {data.summary?.tickets.pending > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {data.summary.tickets.pending} Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="body-sm text-gray-500 mt-1">
                    Last updated {formatRelativeTime(new Date().toISOString())}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/billing")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="body-sm font-semibold text-gray-700">
                    Account Balance
                  </CardTitle>
                  <Wallet className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.summary ? formatCurrency(data.summary.billing.balance) : "$0.00"}
                  </div>
                  <p className="body-sm text-success mt-1">Available balance</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-7 space-y-4 lg:space-y-6">
            {/* Upcoming Renewals */}
            <MobileOptimizedCard
              title="Upcoming Renewals"
              description="Services requiring renewal in the next 30 days"
              collapsible={true}
              defaultCollapsed={false}
              actions={
                <div className="flex items-center space-x-2">
                  <Select value={renewalFilter} onValueChange={handleRenewalFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="domain">Domains</SelectItem>
                      <SelectItem value="hosting">Hosting</SelectItem>
                      <SelectItem value="ssl">SSL Certs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={renewalSort} onValueChange={handleRenewalSort}>
                    <SelectTrigger className="w-32">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expiry">By Expiry</SelectItem>
                      <SelectItem value="price">By Price</SelectItem>
                      <SelectItem value="service">By Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            >
              {loading.renewals ? (
                <RenewalTableSkeleton />
              ) : error.renewals ? (
                <RenewalTableError onRetry={() => refetch.renewals()} />
              ) : data.renewals.length === 0 ? (
                <EmptyState
                  title="No Upcoming Renewals"
                  message="Great! You don't have any services expiring in the next 30 days."
                  action={
                    <Button variant="outline" onClick={() => navigate("/services")}>
                      View All Services
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {data.renewals.map((renewal) => (
                    <div
                      key={renewal.id}
                      className="p-4 bg-gray-50 rounded-lg border space-y-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <button
                          onClick={() => setExpandedRenewal(
                            expandedRenewal === renewal.id ? null : renewal.id
                          )}
                          className="text-left"
                        >
                          <h4 className="font-semibold text-gray-900 text-lg flex items-center">
                            {renewal.service}
                            <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />
                          </h4>
                        </button>
                        <Badge
                          variant={renewal.urgent ? "destructive" : "secondary"}
                          className="body-sm w-fit"
                        >
                          {renewal.urgent ? "⚠️ Urgent" : "📅 Upcoming"}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 body-sm text-gray-600">
                        <span>{renewal.displayType}</span>
                        <span>Expires: {new Date(renewal.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="body-sm text-gray-700">Auto-renew:</span>
                          <Switch
                            checked={renewal.autoRenew}
                            onCheckedChange={() => handleRenewalToggle(renewal.id)}
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-gray-900 text-lg">
                            {formatCurrency(renewal.price)}
                          </span>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 mobile-touch-target"
                          >
                            Renew Now
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded details */}
                      {expandedRenewal === renewal.id && (
                        <div className="mt-4 p-3 bg-white rounded border text-sm text-gray-600">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <strong>Days until expiry:</strong> {renewal.daysUntilExpiry}
                            </div>
                            <div>
                              <strong>Status:</strong> {renewal.status}
                            </div>
                            <div>
                              <strong>Service ID:</strong> {renewal.id}
                            </div>
                            <div>
                              <strong>Currency:</strong> {renewal.currency}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </MobileOptimizedCard>

            {/* Recent Activity */}
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription className="body-sm">
                      Latest updates and changes to your services
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetch.activities()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading.activities ? (
                  <ActivitySkeleton />
                ) : error.activities ? (
                  <ActivityError onRetry={() => refetch.activities()} />
                ) : data.activities.length === 0 ? (
                  <EmptyState
                    title="No Recent Activity"
                    message="No recent activity to display. Activities will appear here as you use our services."
                  />
                ) : (
                  <div className="space-y-4">
                    {data.activities.map((activity) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              activity.status === "success"
                                ? "bg-success/10 text-success"
                                : activity.status === "warning"
                                ? "bg-warning/10 text-warning"
                                : activity.status === "error"
                                ? "bg-error/10 text-error"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="body-sm text-gray-600 truncate">
                              {activity.description}
                            </p>
                          </div>
                          <span className="body-sm text-gray-500 whitespace-nowrap">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 30% */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            {/* Quick Actions */}
            <MobileOptimizedCard
              title="Quick Actions"
              description="Common tasks and shortcuts"
            >
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-primary hover:bg-primary/90 mobile-touch-target"
                  onClick={() => navigate("/services")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Register New Domain
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start mobile-touch-target"
                  onClick={() => navigate("/support")}
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start mobile-touch-target"
                  onClick={() => navigate("/billing")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start mobile-touch-target"
                  onClick={() => navigate("/services")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage DNS
                </Button>
              </div>
            </MobileOptimizedCard>

            {/* System Status */}
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
                  <ExternalLink className="mr-2 h-4 w-4" />
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
                    <span className="body-sm font-medium">
                      {data.summary?.billing.nextPayment ? 
                        new Date(data.summary.billing.nextPayment).toLocaleDateString() : 
                        "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-sm text-gray-700">Auto-pay</span>
                    <Badge variant="default" className="bg-success text-white">
                      ✓ Enabled
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate("/account")}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
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
