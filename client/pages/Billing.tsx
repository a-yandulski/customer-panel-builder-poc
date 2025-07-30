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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Calendar,
  Wallet,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InvoiceList from "@/components/billing/InvoiceList";
import InvoiceDetail from "@/components/billing/InvoiceDetail";
import SubscriptionOverview from "@/components/billing/SubscriptionOverview";
import PaymentMethodsManager from "@/components/billing/PaymentMethodsManager";
import { useBillingSummary, useInvoices, type Invoice } from "@/hooks/useBilling";

export default function Billing() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { summary, loading: summaryLoading, error: summaryError } = useBillingSummary();
  const { downloadInvoicePDF } = useInvoices();

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab("invoice-detail");
  };

  const handleBackToInvoices = () => {
    setSelectedInvoice(null);
    setActiveTab("invoices");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
            <p className="text-gray-600 mt-1">
              Manage your billing information, payment methods, and subscriptions
            </p>
          </div>
        </div>

        {/* Billing Overview */}
        {summaryLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading billing summary...</span>
            </CardContent>
          </Card>
        )}

        {summaryError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{summaryError}</AlertDescription>
          </Alert>
        )}

        {!summaryLoading && !summaryError && summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Current Balance
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.currentBalance)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.currentBalance === 0 ? "No outstanding balance" : "Amount due"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Next Payment
                </CardTitle>
                <Calendar className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.nextPayment.amount)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Due {new Date(summary.nextPayment.dueDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Account Credit
                </CardTitle>
                <Wallet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.accountCredit)}
                </div>
                <p className="text-sm text-green-600 mt-1">Available to use</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  This Month
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.monthlySpend.amount)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.monthlySpend.transactionCount} transactions
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
                <InvoiceList
                  onInvoiceSelect={handleInvoiceSelect}
                  compact={true}
                />
              </div>

              {/* Active Subscriptions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
                <SubscriptionOverview compact={true} />
              </div>
            </div>

            {/* Upcoming Charges */}
            {summary?.upcomingCharges && summary.upcomingCharges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Charges</CardTitle>
                  <CardDescription>
                    Scheduled payments for your services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.upcomingCharges.map((charge) => (
                      <div key={charge.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{charge.service}</p>
                          <p className="text-sm text-gray-600">
                            Due {new Date(charge.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(charge.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <InvoiceList
              onInvoiceSelect={handleInvoiceSelect}
            />
          </TabsContent>

          {/* Invoice Detail Tab */}
          <TabsContent value="invoice-detail" className="space-y-6">
            <InvoiceDetail
              invoiceId={selectedInvoice?.id || null}
              onBack={handleBackToInvoices}
              onDownloadPDF={downloadInvoicePDF}
            />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionOverview />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentMethodsManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function AddPaymentMethodForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    address: "",
    city: "",
    zipCode: "",
    setAsDefault: false,
  });

  return (
    <div className="space-y-4">
      {/* Security Badges */}
      <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-1">
          <Shield className="h-4 w-4 text-success" />
          <span className="text-xs text-success font-medium">
            SSL Encrypted
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Lock className="h-4 w-4 text-success" />
          <span className="text-xs text-success font-medium">
            PCI Compliant
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="body-sm font-semibold">Card Number</Label>
          <Input
            value={formData.cardNumber}
            onChange={(e) =>
              setFormData({ ...formData, cardNumber: e.target.value })
            }
            placeholder="1234 5678 9012 3456"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="body-sm font-semibold">Expiry Date</Label>
            <Input
              value={formData.expiry}
              onChange={(e) =>
                setFormData({ ...formData, expiry: e.target.value })
              }
              placeholder="MM/YY"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="body-sm font-semibold">CVV</Label>
            <Input
              value={formData.cvv}
              onChange={(e) =>
                setFormData({ ...formData, cvv: e.target.value })
              }
              placeholder="123"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="body-sm font-semibold">Cardholder Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="body-sm font-semibold">Billing Address</Label>
          <Input
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="123 Main St"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="body-sm font-semibold">City</Label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="New York"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="body-sm font-semibold">ZIP Code</Label>
            <Input
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              placeholder="10001"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="setAsDefault"
            checked={formData.setAsDefault}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, setAsDefault: checked as boolean })
            }
          />
          <Label htmlFor="setAsDefault" className="body-sm text-gray-600">
            Set as default payment method
          </Label>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          onClick={onClose}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Lock className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
