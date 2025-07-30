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

type PaymentMethod = {
  id: string;
  type: "Visa" | "Mastercard" | "American Express" | "PayPal";
  last4: string;
  expiry: string;
  isDefault: boolean;
  name: string;
};

type Invoice = {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  description: string;
  dueDate?: string;
};

type Subscription = {
  id: string;
  service: string;
  plan: string;
  amount: string;
  billingCycle: "Monthly" | "Yearly";
  nextPayment: string;
  paymentMethod: string;
  autoRenewal: boolean;
  status: "Active" | "Paused" | "Cancelled";
};

export default function Billing() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("all");

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "Visa",
      last4: "4242",
      expiry: "12/26",
      isDefault: true,
      name: "John Doe",
    },
    {
      id: "2",
      type: "Mastercard",
      last4: "8888",
      expiry: "08/27",
      isDefault: false,
      name: "John Doe",
    },
    {
      id: "3",
      type: "PayPal",
      last4: "john@example.com",
      expiry: "",
      isDefault: false,
      name: "john@example.com",
    },
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: "1",
      number: "INV-2024-001",
      date: "Dec 1, 2024",
      amount: "$47.00",
      status: "Paid",
      description: "Domain renewal - example.com",
    },
    {
      id: "2",
      number: "INV-2024-002",
      date: "Nov 15, 2024",
      amount: "$120.00",
      status: "Pending",
      description: "Hosting plan upgrade",
      dueDate: "Dec 15, 2024",
    },
    {
      id: "3",
      number: "INV-2024-003",
      date: "Oct 20, 2024",
      amount: "$89.99",
      status: "Overdue",
      description: "SSL certificate renewal",
      dueDate: "Nov 20, 2024",
    },
    {
      id: "4",
      number: "INV-2024-004",
      date: "Oct 1, 2024",
      amount: "$15.99",
      status: "Paid",
      description: "Domain registration - newsite.com",
    },
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      service: "Web Hosting Pro",
      plan: "Professional Plan",
      amount: "$29.99",
      billingCycle: "Monthly",
      nextPayment: "Dec 15, 2024",
      paymentMethod: "Visa •••• 4242",
      autoRenewal: true,
      status: "Active",
    },
    {
      id: "2",
      service: "Domain Registration",
      plan: "example.com",
      amount: "$12.99",
      billingCycle: "Yearly",
      nextPayment: "Dec 15, 2024",
      paymentMethod: "Visa •••• 4242",
      autoRenewal: true,
      status: "Active",
    },
    {
      id: "3",
      service: "SSL Certificate",
      plan: "Extended Validation",
      amount: "$49.99",
      billingCycle: "Yearly",
      nextPayment: "Jan 5, 2025",
      paymentMethod: "Mastercard •••• 8888",
      autoRenewal: false,
      status: "Active",
    },
  ]);

  const setAsDefault = (cardId: string) => {
    setPaymentMethods((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    );
  };

  const deleteCard = (cardId: string) => {
    setPaymentMethods((prev) => prev.filter((card) => card.id !== cardId));
  };

  const toggleSubscriptionRenewal = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === subId ? { ...sub, autoRenewal: !sub.autoRenewal } : sub,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-success text-white";
      case "Pending":
        return "bg-warning text-white";
      case "Overdue":
        return "bg-error text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "Visa":
        return "💳";
      case "Mastercard":
        return "💳";
      case "American Express":
        return "💳";
      case "PayPal":
        return "🅿️";
      default:
        return "💳";
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Billing & Payments</h1>
            <p className="body text-gray-600 mt-1">
              Manage your billing information, payment methods, and
              subscriptions
            </p>
          </div>
          <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-success" />
                  Add Payment Method
                </DialogTitle>
                <DialogDescription>
                  Add a new credit card or payment method. Your information is
                  secure and encrypted.
                </DialogDescription>
              </DialogHeader>
              <AddPaymentMethodForm onClose={() => setShowAddCard(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Billing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                Current Balance
              </CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$0.00</div>
              <p className="body-sm text-gray-500 mt-1">
                No outstanding balance
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                Next Payment
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$47.00</div>
              <p className="body-sm text-gray-500 mt-1">Due Dec 15, 2024</p>
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
              <p className="body-sm text-success mt-1">Available to use</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="body-sm font-semibold text-gray-700">
                This Month
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$247.00</div>
              <p className="body-sm text-gray-500 mt-1">5 transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Navigation Tabs */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="credit">Account Credit</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                  Saved Payment Methods
                </CardTitle>
                <CardDescription className="body-sm">
                  Manage your credit cards and payment methods. All information
                  is encrypted and secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((card) => (
                  <Card key={card.id} className="border border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getCardIcon(card.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {card.type}{" "}
                              {card.type !== "PayPal"
                                ? `ending in ${card.last4}`
                                : ""}
                            </h4>
                            <p className="body-sm text-gray-600">
                              {card.type === "PayPal"
                                ? card.last4
                                : `Expires ${card.expiry}`}{" "}
                              • {card.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Shield className="h-3 w-3 text-success" />
                              <span className="text-xs text-success">
                                PCI Compliant
                              </span>
                              {card.isDefault && (
                                <>
                                  <Star className="h-3 w-3 text-warning" />
                                  <span className="text-xs text-warning">
                                    Default
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {card.isDefault ? (
                            <Badge className="bg-primary text-white">
                              Default
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAsDefault(card.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCard(card.id)}
                            disabled={card.isDefault}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-error" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="body text-gray-600 mb-4">
                        Add a new payment method
                      </p>
                      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Payment Method
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-32">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-40">
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription className="body-sm">
                  View and download your invoices and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileTable
                  columns={[
                    {
                      key: "number",
                      header: "Invoice #",
                      mobileLabel: "Invoice",
                      render: (value) => (
                        <span className="font-mono font-medium">{value}</span>
                      ),
                    },
                    {
                      key: "date",
                      header: "Date",
                      render: (value) => (
                        <span className="body-sm">{value}</span>
                      ),
                    },
                    {
                      key: "description",
                      header: "Description",
                      render: (value) => (
                        <span className="body-sm">{value}</span>
                      ),
                      hideOnMobile: true,
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      render: (value) => (
                        <span className="font-semibold">{value}</span>
                      ),
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (value, row) => (
                        <div>
                          <TableBadge className={getStatusColor(value)}>
                            {value}
                          </TableBadge>
                          {row.dueDate && value !== "Paid" && (
                            <p className="body-sm text-gray-500 mt-1">
                              Due: {row.dueDate}
                            </p>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "actions",
                      header: "Actions",
                      mobileLabel: "Actions",
                      render: (_, row) => (
                        <TableActions className="justify-end">
                          <MobileActionButton
                            onClick={() => console.log("Download", row.id)}
                            variant="outline"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </MobileActionButton>
                          {row.status === "Pending" && (
                            <MobileActionButton
                              onClick={() => console.log("Pay", row.id)}
                              variant="default"
                              className="bg-primary hover:bg-primary/90"
                            >
                              Pay Now
                            </MobileActionButton>
                          )}
                        </TableActions>
                      ),
                    },
                  ]}
                  data={paginatedInvoices}
                  primaryColumn="number"
                  className="table-auto"
                />

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="body-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredInvoices.length,
                    )}{" "}
                    of {filteredInvoices.length} invoices
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="body-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid gap-6">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Settings className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {subscription.service}
                          </h3>
                          <p className="body-sm text-gray-600">
                            {subscription.plan}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="body-sm text-gray-600">
                              {subscription.amount}/
                              {subscription.billingCycle.toLowerCase()}
                            </span>
                            <span className="body-sm text-gray-600">
                              Next payment: {subscription.nextPayment}
                            </span>
                            <span className="body-sm text-gray-600">
                              {subscription.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge
                            variant={
                              subscription.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {subscription.status}
                          </Badge>
                          <div className="flex items-center space-x-2 mt-2">
                            <Label
                              htmlFor={`auto-renew-${subscription.id}`}
                              className="body-sm text-gray-600"
                            >
                              Auto-renewal:
                            </Label>
                            <Switch
                              id={`auto-renew-${subscription.id}`}
                              checked={subscription.autoRenewal}
                              onCheckedChange={() =>
                                toggleSubscriptionRenewal(subscription.id)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Upgrade
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Account Credit Tab */}
          <TabsContent value="credit" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-primary" />
                  Account Credit & Balance
                </CardTitle>
                <CardDescription className="body-sm">
                  Manage your account credits and add funds to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-primary/5 rounded-lg border">
                    <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="h3 text-gray-900 mb-2">$127.50</h3>
                    <p className="body-sm text-gray-600">Available Credit</p>
                    <Button className="mt-4 bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Funds
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Recent Credit Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="body-sm font-medium">Credit Applied</p>
                          <p className="text-xs text-gray-500">Dec 1, 2024</p>
                        </div>
                        <span className="text-success font-semibold">
                          +$50.00
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="body-sm font-medium">
                            Payment Deducted
                          </p>
                          <p className="text-xs text-gray-500">Nov 28, 2024</p>
                        </div>
                        <span className="text-gray-900 font-semibold">
                          -$22.50
                        </span>
                      </div>
                    </div>
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
