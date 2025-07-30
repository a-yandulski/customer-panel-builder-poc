import React, { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Filter, 
  Search, 
  AlertCircle, 
  Receipt, 
  SortAsc, 
  SortDesc,
  Download,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye
} from "lucide-react";
import { useInvoices, type Invoice } from "@/hooks/useBilling";
import { toast } from "@/hooks/use-toast";

interface InvoiceListProps {
  onInvoiceSelect?: (invoice: Invoice) => void;
  showActions?: boolean;
  compact?: boolean;
}

const STATUS_FILTERS = ["all", "paid", "pending", "overdue"];

export default function InvoiceList({ 
  onInvoiceSelect, 
  showActions = true,
  compact = false 
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { 
    invoices, 
    loading, 
    error, 
    pagination, 
    fetchInvoices, 
    downloadInvoicePDF,
    refetch 
  } = useInvoices();

  // Handle filter changes
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    fetchInvoices({ search, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchInvoices({ status, page: 1 });
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    fetchInvoices({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (page: number) => {
    fetchInvoices({ page });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await downloadInvoicePDF(invoice.id);
    } catch (err) {
      // Error already handled in the hook
    }
  };

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

  if (compact) {
    return (
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading invoices...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Invoices</h3>
            <p className="text-gray-600">No invoices found.</p>
          </div>
        )}

        {!loading && !error && invoices.length > 0 && (
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice) => (
              <Card key={invoice.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onInvoiceSelect?.(invoice)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(invoice.status)}
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Invoice History
            </CardTitle>
            <CardDescription>
              View and download your invoices and payment history
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices by number or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading invoices...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Invoices</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" 
                ? "No invoices match your search criteria."
                : "No invoices found."
              }
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  fetchInvoices({ search: "", status: "all", page: 1 });
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && invoices.length > 0 && (
          <>
            {/* Results summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
                {pagination.totalCount} invoices
              </span>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    fetchInvoices({ search: "", status: "all", page: 1 });
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("number")}
                    >
                      <div className="flex items-center">
                        Invoice #
                        {sortBy === "number" && (
                          sortOrder === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === "date" && (
                          sortOrder === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortBy === "amount" && (
                          sortOrder === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    {showActions && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50"
                              onClick={() => onInvoiceSelect?.(invoice)}>
                      <TableCell className="font-mono font-medium">
                        {invoice.number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(invoice.date)}</p>
                          {invoice.dueDate && invoice.status !== "paid" && (
                            <p className="text-xs text-gray-500">
                              Due: {formatDate(invoice.dueDate)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{invoice.description}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(invoice.status)}
                            <span>{invoice.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInvoiceSelect?.(invoice);
                              }}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPDF(invoice);
                              }}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.status === "pending" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement payment flow
                                  toast({
                                    title: "Payment",
                                    description: "Payment feature coming soon",
                                  });
                                }}
                              >
                                <CreditCard className="mr-1 h-4 w-4" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onInvoiceSelect?.(invoice)}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(invoice.status)}
                          <span className="font-mono font-medium">{invoice.number}</span>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(invoice.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold">
                              {formatCurrency(invoice.amount, invoice.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {showActions && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(invoice);
                            }}
                          >
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                          {invoice.status === "pending" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement payment flow
                                toast({
                                  title: "Payment",
                                  description: "Payment feature coming soon",
                                });
                              }}
                            >
                              <CreditCard className="mr-1 h-4 w-4" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
