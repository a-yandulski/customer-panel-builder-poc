import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface TicketMessage {
  id: string;
  author: string;
  authorType: "customer" | "agent";
  message: string;
  timestamp: string;
  attachments: TicketAttachment[];
}

export interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "waiting" | "solved";
  priority: "low" | "normal" | "high" | "urgent";
  category: "billing" | "technical" | "domain" | "hosting" | "general";
  created: string;
  updated: string;
  assignedAgent?: string;
  lastReplyBy?: "customer" | "agent";
  messageCount?: number;
  hasAttachments?: boolean;
  tags?: string[];
  firstMessage?: string;
  messages?: TicketMessage[];
}

export interface TicketFilters {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: TicketFilters;
}

interface TicketDetailResponse {
  ticket: Ticket;
}

interface CreateTicketData {
  subject: string;
  message: string;
  category: string;
  priority: string;
  attachments?: File[];
}

interface ReplyData {
  message: string;
  attachments?: File[];
}

export function useTickets() {
  const { api } = useApi();
  const [tickets, setTickets] = useState<Ticket[]>([]);
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

  const [filters, setFilters] = useState<TicketFilters>({
    search: "",
    status: "all",
    sortBy: "created",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const fetchTickets = useCallback(async (newFilters?: Partial<TicketFilters>) => {
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

      const response = await api.get<TicketsResponse>(`/tickets?${params.toString()}`);
      
      setTickets(response.tickets);
      setPagination(response.pagination);
      setFilters(currentFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tickets";
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

  const createTicket = useCallback(async (ticketData: CreateTicketData) => {
    try {
      const formData = new FormData();
      formData.append("subject", ticketData.subject);
      formData.append("message", ticketData.message);
      formData.append("category", ticketData.category);
      formData.append("priority", ticketData.priority);

      if (ticketData.attachments) {
        ticketData.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

      const result = await response.json();

      // Add new ticket to the beginning of the list
      setTickets(prev => [result.ticket, ...prev]);

      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });

      return result.ticket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create ticket";
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
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    pagination,
    filters,
    fetchTickets,
    createTicket,
    refetch: () => fetchTickets(),
  };
}

export function useTicketDetails(ticketId: string | null) {
  const { api } = useApi();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<TicketDetailResponse>(`/tickets/${ticketId}`);
      setTicket(response.ticket);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch ticket details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api, ticketId]);

  const replyToTicket = useCallback(async (replyData: ReplyData) => {
    if (!ticketId) return;

    try {
      const formData = new FormData();
      formData.append("message", replyData.message);

      if (replyData.attachments) {
        replyData.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply");
      }

      const result = await response.json();

      // Add new message to ticket
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), result.message],
          updated: new Date().toISOString(),
          lastReplyBy: "customer",
        };
      });

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      return result.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reply";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [ticketId]);

  const updateTicketStatus = useCallback(async (status: string) => {
    if (!ticketId) return;

    try {
      const response = await api.patch(`/tickets/${ticketId}`, { status });
      
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: status as any,
          updated: new Date().toISOString(),
        };
      });

      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update ticket status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [api, ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    } else {
      // Clear ticket state when ticketId becomes null
      setTicket(null);
      setError(null);
      setLoading(false);
    }
  }, [ticketId]);

  return {
    ticket,
    loading,
    error,
    fetchTicket,
    replyToTicket,
    updateTicketStatus,
    refetch: fetchTicket,
  };
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (file.size > maxSize) {
      return `File ${file.name} exceeds 5MB size limit`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.jar'];
    const hasExtension = dangerousExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (hasExtension) {
      return `File type is not allowed for security reasons`;
    }

    return null;
  }, []);

  const validateFiles = useCallback((files: File[]): string[] => {
    const errors: string[] = [];

    if (files.length > 5) {
      errors.push("Maximum 5 files allowed per upload");
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 20 * 1024 * 1024) { // 20MB total limit
      errors.push("Total file size exceeds 20MB limit");
    }

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      }
    });

    return errors;
  }, [validateFile]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const downloadAttachment = useCallback(async (attachmentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });

      if (response.status === 302) {
        // Handle redirect to actual file URL
        const location = response.headers.get('Location');
        if (location) {
          // Open in new tab for download
          window.open(location, '_blank');
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download attachment');
      }

      toast({
        title: "Success",
        description: "File download started",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download file";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    validateFile,
    validateFiles,
    formatFileSize,
    downloadAttachment,
    setUploading,
    setUploadProgress,
  };
}

// Real-time updates simulation (for future WebSocket implementation)
export function useTicketUpdates(ticketId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!ticketId) return;

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Random chance of receiving an update
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const updateTypes = ['status_change', 'new_reply', 'agent_assigned'];
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        const notification = {
          id: Date.now().toString(),
          type: randomType,
          ticketId,
          timestamp: new Date().toISOString(),
          message: `Ticket ${ticketId} has been updated`,
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [ticketId]);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  return {
    notifications,
    clearNotification,
  };
}
