import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export interface Domain {
  id: string;
  name: string;
  status: "active" | "expired" | "pending_transfer" | "pending";
  expiryDate: string;
  registrationDate: string;
  autoRenew: boolean;
  registrar: string;
  nameservers: string[];
  dnsProvider: string;
  locked: boolean;
  tags: string[];
  contactId: string;
}

export interface DNSRecord {
  id: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
}

export interface DomainFilters {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface DomainsResponse {
  domains: Domain[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: DomainFilters;
}

interface DNSRecordsResponse {
  records: DNSRecord[];
  domain: string;
  totalCount: number;
}

export function useDomains() {
  const { api } = useApi();
  const [domains, setDomains] = useState<Domain[]>([]);
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

  const [filters, setFilters] = useState<DomainFilters>({
    search: "",
    status: "all",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 10,
  });

  const fetchDomains = useCallback(async (newFilters?: Partial<DomainFilters>) => {
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

      const response = await api.get<DomainsResponse>(`/domains?${params.toString()}`);
      
      setDomains(response.domains);
      setPagination(response.pagination);
      setFilters(currentFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch domains";
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

  const updateDomain = useCallback(async (domainId: string, updates: Partial<Domain>) => {
    try {
      const response = await api.patch<{ domain: Domain }>(`/domains/${domainId}`, updates);
      
      // Optimistic update
      setDomains(prev => 
        prev.map(domain => 
          domain.id === domainId 
            ? { ...domain, ...response.domain }
            : domain
        )
      );

      toast({
        title: "Success",
        description: "Domain updated successfully",
      });

      return response.domain;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update domain";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [api]);

  const toggleAutoRenew = useCallback(async (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain) return;

    // Optimistic update
    const newAutoRenew = !domain.autoRenew;
    setDomains(prev => 
      prev.map(d => 
        d.id === domainId 
          ? { ...d, autoRenew: newAutoRenew }
          : d
      )
    );

    try {
      await updateDomain(domainId, { autoRenew: newAutoRenew });
    } catch (err) {
      // Rollback on error
      setDomains(prev => 
        prev.map(d => 
          d.id === domainId 
            ? { ...d, autoRenew: domain.autoRenew }
            : d
        )
      );
    }
  }, [domains, updateDomain]);

  const updateNameservers = useCallback(async (domainId: string, nameservers: string[]) => {
    try {
      const response = await api.patch<{ domain: { nameservers: string[] } }>(
        `/domains/${domainId}/nameservers`,
        { nameservers }
      );

      setDomains(prev => 
        prev.map(domain => 
          domain.id === domainId 
            ? { ...domain, nameservers: response.domain.nameservers }
            : domain
        )
      );

      toast({
        title: "Success",
        description: "Nameservers updated successfully",
      });

      return response.domain;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update nameservers";
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
    fetchDomains();
  }, []);

  return {
    domains,
    loading,
    error,
    pagination,
    filters,
    fetchDomains,
    updateDomain,
    toggleAutoRenew,
    updateNameservers,
    refetch: () => fetchDomains(),
  };
}

export function useDNSRecords(domainId: string | null) {
  const { api } = useApi();
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDNSRecords = useCallback(async (recordType?: string, sortBy?: string) => {
    if (!domainId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (recordType && recordType !== "all") params.append("type", recordType);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await api.get<DNSRecordsResponse>(
        `/domains/${domainId}/dns?${params.toString()}`
      );
      
      setRecords(response.records);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch DNS records";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api, domainId]);

  useEffect(() => {
    if (domainId) {
      fetchDNSRecords();
    }
  }, [domainId]);

  return {
    records,
    loading,
    error,
    fetchDNSRecords,
    refetch: () => fetchDNSRecords(),
  };
}

export function useDomainDetails(domainId: string | null) {
  const { api } = useApi();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomain = useCallback(async () => {
    if (!domainId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ domain: Domain }>(`/domains/${domainId}`);
      setDomain(response.domain);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch domain details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api, domainId]);

  useEffect(() => {
    if (domainId) {
      fetchDomain();
    }
  }, [domainId, fetchDomain]);

  return {
    domain,
    loading,
    error,
    refetch: fetchDomain,
  };
}
