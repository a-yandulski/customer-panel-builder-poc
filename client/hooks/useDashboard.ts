import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";

interface ServiceSummary {
  domains: { total: number; active: number; expiring: number };
  subscriptions: { total: number; active: number; suspended: number };
  tickets: { total: number; open: number; pending: number; closed: number };
  billing: { 
    balance: number; 
    currency: string;
    nextPayment: string;
    overdue: number;
  };
}

interface Renewal {
  id: string;
  service: string;
  type: string;
  displayType: string;
  expiryDate: string;
  price: number;
  currency: string;
  autoRenew: boolean;
  urgent: boolean;
  daysUntilExpiry: number;
  status: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "info" | "warning" | "error";
  metadata?: Record<string, any>;
}

interface DashboardData {
  summary: ServiceSummary | null;
  renewals: Renewal[];
  activities: Activity[];
}

interface UseDashboardReturn {
  data: DashboardData;
  loading: {
    summary: boolean;
    renewals: boolean;
    activities: boolean;
  };
  error: {
    summary: string | null;
    renewals: string | null;
    activities: string | null;
  };
  refetch: {
    summary: () => Promise<void>;
    renewals: (options?: { window?: number; sortBy?: string; type?: string }) => Promise<void>;
    activities: (options?: { limit?: number }) => Promise<void>;
    all: () => Promise<void>;
  };
  isRefreshing: boolean;
}

export function useDashboard(): UseDashboardReturn {
  const { api } = useApi();
  
  // Data state
  const [data, setData] = useState<DashboardData>({
    summary: null,
    renewals: [],
    activities: []
  });

  // Loading state
  const [loading, setLoading] = useState({
    summary: true,
    renewals: true,
    activities: true
  });

  // Error state
  const [error, setError] = useState({
    summary: null as string | null,
    renewals: null as string | null,
    activities: null as string | null
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch service summary
  const fetchSummary = useCallback(async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    setError(prev => ({ ...prev, summary: null }));
    
    try {
      const response = await api.get<{ summary: ServiceSummary; lastUpdated: string }>('/services/summary');
      setData(prev => ({ ...prev, summary: response.summary }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service summary';
      setError(prev => ({ ...prev, summary: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  }, [api]);

  // Fetch renewals
  const fetchRenewals = useCallback(async (options?: { window?: number; sortBy?: string; type?: string }) => {
    setLoading(prev => ({ ...prev, renewals: true }));
    setError(prev => ({ ...prev, renewals: null }));
    
    try {
      const params = new URLSearchParams();
      if (options?.window) params.append('window', options.window.toString());
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.type) params.append('type', options.type);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/renewals?${queryString}` : '/renewals';
      
      const response = await api.get<{
        renewals: Renewal[];
        totalAmount: number;
        currency: string;
        window: number;
        count: number;
      }>(endpoint);
      
      setData(prev => ({ ...prev, renewals: response.renewals }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch renewals';
      setError(prev => ({ ...prev, renewals: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, renewals: false }));
    }
  }, [api]);

  // Fetch activities
  const fetchActivities = useCallback(async (options?: { limit?: number }) => {
    setLoading(prev => ({ ...prev, activities: true }));
    setError(prev => ({ ...prev, activities: null }));
    
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      
      const queryString = params.toString();
      const endpoint = queryString ? `/dashboard/activity?${queryString}` : '/dashboard/activity';
      
      const response = await api.get<{
        activities: Activity[];
        hasMore: boolean;
        total: number;
      }>(endpoint);
      
      setData(prev => ({ ...prev, activities: response.activities }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
      setError(prev => ({ ...prev, activities: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, [api]);

  // Refetch all data
  const refetchAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchSummary(),
        fetchRenewals({ window: 30 }),
        fetchActivities({ limit: 5 })
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchSummary, fetchRenewals, fetchActivities]);

  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      setIsRefreshing(true);
      try {
        await Promise.all([
          fetchSummary(),
          fetchRenewals({ window: 30 }),
          fetchActivities({ limit: 5 })
        ]);
      } finally {
        setIsRefreshing(false);
      }
    };

    initialFetch();
  }, []); // Empty dependency array for initial fetch only

  return {
    data,
    loading,
    error,
    refetch: {
      summary: fetchSummary,
      renewals: fetchRenewals,
      activities: fetchActivities,
      all: refetchAll
    },
    isRefreshing
  };
}

// Hook for real-time updates simulation
export function useDashboardPolling(intervalMs: number = 30000) {
  const { refetch } = useDashboard();
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      // Only refresh summary and activities, not renewals (less frequent)
      Promise.all([
        refetch.summary(),
        refetch.activities({ limit: 5 })
      ]);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPolling, intervalMs, refetch]);

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  return { isPolling, startPolling, stopPolling };
}

export type { ServiceSummary, Renewal, Activity, DashboardData };
