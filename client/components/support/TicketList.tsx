import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  MessageCircle,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  User,
  Tag,
  Paperclip,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Plus,
} from "lucide-react";
import { useTickets, type Ticket } from "@/hooks/useSupport";
import { toast } from "@/hooks/use-toast";

interface TicketListProps {
  onTicketSelect?: (ticket: Ticket) => void;
  onCreateTicket?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const STATUS_FILTERS = ["all", "open", "in_progress", "waiting", "solved"];
const SORT_OPTIONS = [
  { value: "created", label: "Date Created" },
  { value: "updated", label: "Last Updated" },
  { value: "subject", label: "Subject" },
  { value: "priority", label: "Priority" },
];

export default function TicketList({
  onTicketSelect,
  onCreateTicket,
  showActions = true,
  compact = false,
}: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { tickets, loading, error, pagination, fetchTickets, refetch } =
    useTickets();

  // Handle filter changes
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    fetchTickets({ search, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchTickets({ status, page: 1 });
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    fetchTickets({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (page: number) => {
    fetchTickets({ page });
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "waiting":
        return "bg-orange-100 text-orange-800";
      case "solved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <MessageCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "waiting":
        return <Pause className="h-4 w-4" />;
      case "solved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-700";
      case "normal":
        return "bg-blue-100 text-blue-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading tickets...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Support Tickets
            </h3>
            <p className="text-gray-600">No tickets found.</p>
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onTicketSelect?.(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-gray-600">#{ticket.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(ticket.updated)}
                      </p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-600 mt-1">
            View and manage your support tickets
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {onCreateTicket && (
            <Button onClick={onCreateTicket}>
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets by subject, ID, or content..."
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
                  {STATUS_FILTERS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all"
                        ? "All Status"
                        : status.replace("_", " ").charAt(0).toUpperCase() +
                          status.replace("_", " ").slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => handleSort(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Loading tickets...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && tickets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No Matching Tickets"
                  : "No Support Tickets"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't created any support tickets yet."}
              </p>
              {searchTerm || statusFilter !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    fetchTickets({ search: "", status: "all", page: 1 });
                  }}
                >
                  Clear filters
                </Button>
              ) : onCreateTicket ? (
                <Button onClick={onCreateTicket}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Ticket
                </Button>
              ) : null}
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <>
              {/* Results summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalCount,
                  )}{" "}
                  of {pagination.totalCount} tickets
                </span>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      fetchTickets({ search: "", status: "all", page: 1 });
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
                        onClick={() => handleSort("subject")}
                      >
                        <div className="flex items-center">
                          Subject
                          {sortBy === "subject" &&
                            (sortOrder === "asc" ? (
                              <SortAsc className="ml-1 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("created")}
                      >
                        <div className="flex items-center">
                          Created
                          {sortBy === "created" &&
                            (sortOrder === "asc" ? (
                              <SortAsc className="ml-1 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("updated")}
                      >
                        <div className="flex items-center">
                          Last Updated
                          {sortBy === "updated" &&
                            (sortOrder === "asc" ? (
                              <SortAsc className="ml-1 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      {showActions && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => onTicketSelect?.(ticket)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium truncate max-w-xs">
                                {ticket.subject}
                              </p>
                              {ticket.hasAttachments && (
                                <Paperclip className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>#{ticket.id}</span>
                              {ticket.messageCount && (
                                <>
                                  <span>•</span>
                                  <span>{ticket.messageCount} messages</span>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(ticket.status)}
                              <span>{ticket.status.replace("_", " ")}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(ticket.priority)}
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {ticket.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(ticket.created)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{getTimeAgo(ticket.updated)}</p>
                            {ticket.lastReplyBy && (
                              <p className="text-xs text-gray-500">
                                by {ticket.lastReplyBy}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        {showActions && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTicketSelect?.(ticket);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onTicketSelect?.(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            {getStatusIcon(ticket.status)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {ticket.subject}
                              </p>
                              <p className="text-xs text-gray-600">
                                #{ticket.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge
                              className={getStatusColor(ticket.status)}
                              size="sm"
                            >
                              {ticket.status.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(ticket.priority)}
                              size="sm"
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Tag className="h-3 w-3" />
                              <span className="capitalize">
                                {ticket.category}
                              </span>
                            </div>
                            {ticket.messageCount && (
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{ticket.messageCount}</span>
                              </div>
                            )}
                            {ticket.hasAttachments && (
                              <Paperclip className="h-3 w-3" />
                            )}
                          </div>
                          <div className="text-right">
                            <p>{getTimeAgo(ticket.updated)}</p>
                            {ticket.lastReplyBy && (
                              <p>by {ticket.lastReplyBy}</p>
                            )}
                          </div>
                        </div>

                        {ticket.assignedAgent && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <User className="h-3 w-3" />
                            <span>Assigned to {ticket.assignedAgent}</span>
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
    </div>
  );
}
