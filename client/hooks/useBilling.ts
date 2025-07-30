import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  description: string;
  lineItems: InvoiceLineItem[];
  paymentMethod?: string;
  paymentDate?: string;
  downloadUrl: string;
  billingAddress?: BillingAddress;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface BillingAddress {
  name: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Subscription {
  id: string;
  service: string;
  plan: string;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  nextPayment: string;
  paymentMethod: string;
  autoRenewal: boolean;
  status: "active" | "paused" | "cancelled";
  startDate: string;
  features: string[];
  cancellationPolicy: string;
}

export interface PaymentSource {
  id: string;
  type: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName: string;
  brand: string;
  country: string;
  addedDate: string;
  fingerprint?: string;
}

export interface BillingSummary {
  currentBalance: number;
  accountCredit: number;
  nextPayment: {
    amount: number;
    dueDate: string;
    description: string;
  };
  monthlySpend: {
    amount: number;
    transactionCount: number;
    period: string;
  };
  upcomingCharges: Array<{
    id: string;
    service: string;
    amount: number;
    dueDate: string;
  }>;
}

export interface InvoiceFilters {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: InvoiceFilters;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  totalCount: number;
}

interface PaymentSourcesResponse {
  paymentSources: PaymentSource[];
  totalCount: number;
}

export function useInvoices() {
  const { api } = useApi();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const fetchInvoices = useCallback(async (newFilters?: Partial<InvoiceFilters>) => {
    const currentFilters = { ...filters, ...newFilters };
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append("search", currentFilters.search);
      if (currentFilters.status !== "all") params.append("status", currentFilters.status);
      params.append("sortBy", currentFilters.sortBy);
      params.append("sortOrder", currentFilters.sortOrder);
      params.append("page", currentFilters.page.toString());
      params.append("limit", currentFilters.limit.toString());

      const response = await api.get<InvoicesResponse>(`/invoices?${params.toString()}`);
      
      setInvoices(response.invoices);
      setPagination(response.pagination);
      setFilters(currentFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch invoices";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  const downloadInvoicePDF = useCallback(async (invoiceId: string) => {
    try {
      // Open PDF in new window/tab for download
      const pdfUrl = `/api/invoices/${invoiceId}/pdf`;
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (response.status === 302) {
        // Handle redirect to actual PDF URL
        const location = response.headers.get('Location');
        if (location) {
          window.open(location, '_blank');
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download PDF');
      }

      toast({
        title: "Success",
        description: "Invoice PDF download started",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download invoice PDF";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    pagination,
    filters,
    fetchInvoices,
    downloadInvoicePDF,
    refetch: () => fetchInvoices(),
  };
}

export function useInvoiceDetails(invoiceId: string | null) {
  const { api } = useApi();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ invoice: Invoice }>(`/invoices/${invoiceId}`);
      setInvoice(response.invoice);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch invoice details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api, invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
  };
}

export function useSubscriptions() {
  const { api } = useApi();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<SubscriptionsResponse>("/subscriptions");
      setSubscriptions(response.subscriptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subscriptions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateSubscription = useCallback(async (subscriptionId: string, updates: Partial<Subscription>) => {
    try {
      const response = await api.patch<{ subscription: Subscription }>(`/subscriptions/${subscriptionId}`, updates);
      
      // Optimistic update
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === subscriptionId 
            ? { ...subscription, ...response.subscription }
            : subscription
        )
      );

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      return response.subscription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update subscription";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [api]);

  const toggleAutoRenewal = useCallback(async (subscriptionId: string) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    // Optimistic update
    const newAutoRenewal = !subscription.autoRenewal;
    setSubscriptions(prev => 
      prev.map(s => 
        s.id === subscriptionId 
          ? { ...s, autoRenewal: newAutoRenewal }
          : s
      )
    );

    try {
      await updateSubscription(subscriptionId, { autoRenewal: newAutoRenewal });
    } catch (err) {
      // Rollback on error
      setSubscriptions(prev => 
        prev.map(s => 
          s.id === subscriptionId 
            ? { ...s, autoRenewal: subscription.autoRenewal }
            : s
        )
      );
    }
  }, [subscriptions, updateSubscription]);

  // Initial fetch
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    updateSubscription,
    toggleAutoRenewal,
    refetch: fetchSubscriptions,
  };
}

export function usePaymentSources() {
  const { api } = useApi();
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentSources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<PaymentSourcesResponse>("/payment_sources");
      setPaymentSources(response.paymentSources);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payment methods";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  const addPaymentSource = useCallback(async (paymentData: any) => {
    try {
      const response = await api.post<{ paymentSource: PaymentSource }>("/payment_sources", paymentData);
      
      setPaymentSources(prev => [...prev, response.paymentSource]);

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      return response.paymentSource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add payment method";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [api]);

  const deletePaymentSource = useCallback(async (paymentSourceId: string) => {
    try {
      await api.delete(`/payment_sources/${paymentSourceId}`);
      
      setPaymentSources(prev => prev.filter(ps => ps.id !== paymentSourceId));

      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete payment method";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [api]);

  const setDefaultPaymentSource = useCallback(async (paymentSourceId: string) => {
    try {
      const response = await api.post<{ paymentSource: PaymentSource }>(`/payment_sources/${paymentSourceId}/default`);
      
      // Update all payment sources - remove default from others, set for this one
      setPaymentSources(prev => 
        prev.map(ps => ({
          ...ps,
          isDefault: ps.id === paymentSourceId
        }))
      );

      toast({
        title: "Success",
        description: "Default payment method updated",
      });

      return response.paymentSource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update default payment method";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [api]);

  // Initial fetch
  useEffect(() => {
    fetchPaymentSources();
  }, []);

  return {
    paymentSources,
    loading,
    error,
    fetchPaymentSources,
    addPaymentSource,
    deletePaymentSource,
    setDefaultPaymentSource,
    refetch: fetchPaymentSources,
  };
}

export function useBillingSummary() {
  const { api } = useApi();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<BillingSummary>("/billing/summary");
      setSummary(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch billing summary";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    fetchSummary,
    refetch: fetchSummary,
  };
}
