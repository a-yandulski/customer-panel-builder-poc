import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  AlertCircle,
  Receipt,
  Download,
  Printer,
  Mail,
  Copy,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Building,
  MapPin,
  User,
  Hash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvoiceDetails, type Invoice } from "@/hooks/useBilling";
import { toast } from "@/hooks/use-toast";

interface InvoiceDetailProps {
  invoiceId: string | null;
  onBack?: () => void;
  onDownloadPDF?: (invoiceId: string) => Promise<void>;
}

export default function InvoiceDetail({
  invoiceId,
  onBack,
  onDownloadPDF,
}: InvoiceDetailProps) {
  const { invoice, loading, error, refetch } = useInvoiceDetails(invoiceId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const calculateSubtotal = () => {
    if (!invoice?.lineItems) return 0;
    return invoice.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxItem = invoice?.lineItems.find((item) =>
      item.description.toLowerCase().includes("tax"),
    );
    return taxItem ? taxItem.unitPrice : subtotal * 0.08; // 8% default tax if not specified
  };

  const handleDownloadPDF = async () => {
    if (invoice && onDownloadPDF) {
      try {
        await onDownloadPDF(invoice.id);
      } catch (err) {
        // Error already handled
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = () => {
    toast({
      title: "Email Invoice",
      description: "Invoice email feature coming soon",
    });
  };

  const copyInvoiceNumber = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice.number);
      toast({
        title: "Copied!",
        description: "Invoice number copied to clipboard",
      });
    }
  };

  if (!invoiceId) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Select an Invoice
          </h3>
          <p className="text-gray-600">
            Choose an invoice from the list to view its details.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading invoice details...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !invoice) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Invoice not found"}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Receipt className="h-6 w-6" />
              <span>Invoice {invoice.number}</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Invoice details and payment information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleEmailInvoice}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Invoice {invoice.number}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyInvoiceNumber}
                      className="p-1"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {invoice.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(invoice.status)} size="lg">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(invoice.status)}
                    <span className="font-medium">
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Invoice Date</span>
                  </div>
                  <p className="font-medium">{formatDate(invoice.date)}</p>
                </div>
                {invoice.dueDate && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Due Date</span>
                    </div>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Breakdown of charges and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Line Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoice.lineItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {formatCurrency(item.unitPrice, invoice.currency)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(
                              item.quantity * item.unitPrice,
                              invoice.currency,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Invoice Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            calculateSubtotal(),
                            invoice.currency,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">
                          {formatCurrency(calculateTax(), invoice.currency)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {invoice.status === "paid" && invoice.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4" />
                      <span>Payment Method</span>
                    </div>
                    <p className="font-medium">{invoice.paymentMethod}</p>
                  </div>
                  {invoice.paymentDate && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Payment Date</span>
                      </div>
                      <p className="font-medium">
                        {formatDate(invoice.paymentDate)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Payment received. Thank you for your business!
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Payment Actions */}
          {invoice.status === "pending" && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-700">
                  <Clock className="h-5 w-5" />
                  <span>Payment Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 text-yellow-700 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Payment Pending</span>
                  </div>
                  <p className="text-sm text-yellow-600">
                    This invoice is awaiting payment. Please pay by{" "}
                    {invoice.dueDate
                      ? formatDate(invoice.dueDate)
                      : "the due date"}{" "}
                    to avoid late fees.
                  </p>
                </div>
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now - {formatCurrency(invoice.amount, invoice.currency)}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Overdue Payment Actions */}
          {invoice.status === "overdue" && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Payment Overdue</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 text-red-700 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Payment Overdue</span>
                  </div>
                  <p className="text-sm text-red-600">
                    This invoice is past due. Please pay immediately to avoid
                    service disruption and additional fees.
                  </p>
                </div>
                <Button variant="destructive" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now - {formatCurrency(invoice.amount, invoice.currency)}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleEmailInvoice}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={copyInvoiceNumber}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Invoice #
              </Button>
            </CardContent>
          </Card>

          {/* Billing Address */}
          {invoice.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Billing Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 mt-0.5 text-gray-400" />
                  <div>
                    <p className="font-medium">{invoice.billingAddress.name}</p>
                    {invoice.billingAddress.company && (
                      <p className="text-gray-600">
                        {invoice.billingAddress.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 mt-0.5 text-gray-400" />
                  <div>
                    <p>{invoice.billingAddress.street}</p>
                    <p>
                      {invoice.billingAddress.city},{" "}
                      {invoice.billingAddress.state}{" "}
                      {invoice.billingAddress.postalCode}
                    </p>
                    <p>{invoice.billingAddress.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Invoice ID:</span>
                <span className="font-mono">{invoice.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{invoice.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
              {invoice.paymentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Paid on:</span>
                  <span className="font-medium">
                    {formatDate(invoice.paymentDate)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
