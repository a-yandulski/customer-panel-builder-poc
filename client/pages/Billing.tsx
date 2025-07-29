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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Download,
  DollarSign,
  Calendar,
  Receipt,
} from "lucide-react";

export default function Billing() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Billing</h1>
            <p className="body text-gray-600 mt-1">
              Manage your billing information and payment methods
            </p>
          </div>
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>

        {/* Billing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Current Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$0.00</div>
              <p className="text-xs text-gray-500 mt-1">
                No outstanding balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Next Payment
              </CardTitle>
              <Calendar className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$47.00</div>
              <p className="text-xs text-gray-500 mt-1">Due Dec 15, 2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                This Month
              </CardTitle>
              <Receipt className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$247.00</div>
              <p className="text-xs text-gray-500 mt-1">5 transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Tabs */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <div className="grid gap-4">
              {[
                {
                  id: "INV-2024-001",
                  amount: "$47.00",
                  date: "Dec 1, 2024",
                  status: "Paid",
                  description: "Domain renewal - example.com",
                },
                {
                  id: "INV-2024-002",
                  amount: "$120.00",
                  date: "Nov 15, 2024",
                  status: "Paid",
                  description: "Hosting plan upgrade",
                },
                {
                  id: "INV-2024-003",
                  amount: "$80.00",
                  date: "Nov 1, 2024",
                  status: "Paid",
                  description: "SSL certificates (2x)",
                },
              ].map((invoice, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <Receipt className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {invoice.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {invoice.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {invoice.amount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.date}
                          </div>
                        </div>
                        <Badge variant="default">{invoice.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="grid gap-4">
              {[
                {
                  type: "Visa",
                  last4: "4242",
                  expires: "12/26",
                  isDefault: true,
                },
                {
                  type: "Mastercard",
                  last4: "8888",
                  expires: "08/27",
                  isDefault: false,
                },
              ].map((card, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <CreditCard className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {card.type} ending in {card.last4}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Expires {card.expires}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {card.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="grid gap-4">
              {[
                {
                  date: "Dec 1, 2024",
                  amount: "$47.00",
                  method: "Visa •••• 4242",
                  status: "Completed",
                  description: "Domain renewal payment",
                },
                {
                  date: "Nov 15, 2024",
                  amount: "$120.00",
                  method: "Visa •••• 4242",
                  status: "Completed",
                  description: "Hosting upgrade payment",
                },
                {
                  date: "Nov 1, 2024",
                  amount: "$80.00",
                  method: "Mastercard •••• 8888",
                  status: "Completed",
                  description: "SSL certificate payment",
                },
              ].map((payment, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {payment.amount}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {payment.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {payment.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.method}
                        </div>
                        <Badge variant="default" className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
