import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, 
  AlertCircle, 
  Settings, 
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  X,
  Info,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Globe,
  Mail,
  Database
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useSubscriptions, type Subscription } from "@/hooks/useBilling";

interface SubscriptionOverviewProps {
  onSubscriptionSelect?: (subscription: Subscription) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function SubscriptionOverview({ 
  onSubscriptionSelect, 
  showActions = true,
  compact = false 
}: SubscriptionOverviewProps) {
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; subscription: Subscription | null }>({
    open: false,
    subscription: null,
  });

  const { 
    subscriptions, 
    loading, 
    error, 
    toggleAutoRenewal,
    refetch 
  } = useSubscriptions();

  const handleAutoRenewalToggle = (subscription: Subscription) => {
    setConfirmDialog({ open: true, subscription });
  };

  const confirmAutoRenewalToggle = async () => {
    if (confirmDialog.subscription) {
      await toggleAutoRenewal(confirmDialog.subscription.id);
    }
    setConfirmDialog({ open: false, subscription: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes("hosting")) {
      return <Globe className="h-6 w-6" />;
    } else if (service.toLowerCase().includes("domain")) {
      return <Globe className="h-6 w-6" />;
    } else if (service.toLowerCase().includes("ssl")) {
      return <Shield className="h-6 w-6" />;
    } else if (service.toLowerCase().includes("email")) {
      return <Mail className="h-6 w-6" />;
    } else if (service.toLowerCase().includes("database")) {
      return <Database className="h-6 w-6" />;
    }
    return <Settings className="h-6 w-6" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getDaysUntilNextPayment = (nextPayment: string) => {
    const today = new Date();
    const paymentDate = new Date(nextPayment);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading subscriptions...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && subscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Subscriptions</h3>
            <p className="text-gray-600">No active subscriptions found.</p>
          </div>
        )}

        {!loading && !error && subscriptions.length > 0 && (
          <div className="space-y-3">
            {subscriptions.slice(0, 3).map((subscription) => (
              <Card key={subscription.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSubscriptionSelect?.(subscription)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getServiceIcon(subscription.service)}
                      </div>
                      <div>
                        <p className="font-medium">{subscription.service}</p>
                        <p className="text-sm text-gray-600">{subscription.plan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(subscription.amount)}/{subscription.billingCycle}
                      </p>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Subscriptions</h2>
          <p className="text-gray-600 mt-1">
            Manage your service subscriptions and billing cycles
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading subscriptions...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && subscriptions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Active Subscriptions</h3>
            <p className="text-gray-600 mb-6">
              You don't have any active subscriptions at the moment.
            </p>
            <Button variant="outline">
              Browse Services
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && subscriptions.length > 0 && (
        <div className="grid gap-6">
          {subscriptions.map((subscription) => {
            const daysUntilPayment = getDaysUntilNextPayment(subscription.nextPayment);
            const isUpcoming = daysUntilPayment <= 7 && daysUntilPayment > 0;
            const isOverdue = daysUntilPayment < 0;

            return (
              <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {getServiceIcon(subscription.service)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {subscription.service}
                          </h3>
                          <Badge className={getStatusColor(subscription.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(subscription.status)}
                              <span>{subscription.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{subscription.plan}</p>

                        {/* Service Features */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Included Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {subscription.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Billing Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">
                              {formatCurrency(subscription.amount)}/{subscription.billingCycle}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600">Next payment:</span>
                            <span className="font-medium">
                              {formatDate(subscription.nextPayment)}
                            </span>
                            {isUpcoming && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Clock className="h-3 w-3 mr-1" />
                                {daysUntilPayment} days
                              </Badge>
                            )}
                            {isOverdue && (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-purple-600" />
                            <span className="text-gray-600">Payment:</span>
                            <span className="font-medium">{subscription.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(subscription.amount)}
                        </p>
                        <p className="text-sm text-gray-600">per {subscription.billingCycle}</p>
                      </div>

                      {showActions && (
                        <div className="flex flex-col space-y-2">
                          {/* Auto-renewal toggle */}
                          <div className="flex items-center space-x-3">
                            <Label htmlFor={`auto-renew-${subscription.id}`} className="text-sm">
                              Auto-renewal:
                            </Label>
                            <Switch
                              id={`auto-renew-${subscription.id}`}
                              checked={subscription.autoRenewal}
                              onCheckedChange={() => handleAutoRenewalToggle(subscription)}
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <TrendingUp className="mr-1 h-4 w-4" />
                              Upgrade
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="mr-1 h-4 w-4" />
                              Manage
                            </Button>
                          </div>

                          {subscription.status === "active" && (
                            <Button variant="outline" size="sm" className="w-full">
                              <Pause className="mr-1 h-4 w-4" />
                              Pause
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Started: {formatDate(subscription.startDate)}</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="mr-1 h-3 w-3" />
                              Cancellation Policy
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancellation Policy</DialogTitle>
                              <DialogDescription>
                                {subscription.cancellationPolicy}
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {!subscription.autoRenewal && (
                        <div className="flex items-center space-x-1 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Auto-renewal disabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog({ open, subscription: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.subscription?.autoRenewal ? "Disable" : "Enable"} Auto-Renewal
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.subscription?.autoRenewal 
                ? `Are you sure you want to disable auto-renewal for ${confirmDialog.subscription?.service}? You'll need to manually renew before the next billing cycle.`
                : `Enable auto-renewal for ${confirmDialog.subscription?.service}? Your payment method will be charged automatically on ${confirmDialog.subscription?.nextPayment}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, subscription: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAutoRenewalToggle}
              variant={confirmDialog.subscription?.autoRenewal ? "destructive" : "default"}
            >
              {confirmDialog.subscription?.autoRenewal ? "Disable" : "Enable"} Auto-Renewal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
