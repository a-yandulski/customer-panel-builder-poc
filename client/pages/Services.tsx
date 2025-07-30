import React, { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { useDomains, type Domain } from "@/hooks/useDomains";
import NameserverManager from "@/components/domains/NameserverManager";
import DNSRecordsViewer from "@/components/domains/DNSRecordsViewer";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  Server,
  Shield,
  Mail,
  Search,
  Filter,
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Services() {
  const {
    domains,
    loading,
    error,
    pagination,
    filters,
    fetchDomains,
    toggleAutoRenew,
    updateNameservers,
  } = useDomains();

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [showAuthCode, setShowAuthCode] = useState<string | null>(null);

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      fetchDomains({ search: value, page: 1 });
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  // Handle filter changes
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchDomains({ status, page: 1 });
  };

  const handleSort = (newSortBy: string) => {
    setSortBy(newSortBy);
    fetchDomains({ sortBy: newSortBy, page: 1 });
  };

  const toggleDomainExpansion = (domainId: string) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "destructive";
      case "pending":
        return "secondary";
      case "pending_transfer":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "pending_transfer":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return "text-red-600 font-medium";
    if (days <= 30) return "text-yellow-600 font-medium";
    return "text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleNameserverUpdate = async (
    domainId: string,
    nameservers: string[],
  ) => {
    await updateNameservers(domainId, nameservers);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Services</h1>
            <p className="body text-gray-600 mt-1">
              Manage your domains, hosting, security, and email services
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Services Navigation Tabs */}
        <Tabs defaultValue="domains" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="hosting">Hosting</TabsTrigger>
            <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="domains" className="space-y-6">
            {/* Search & Filter Controls */}
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search domains..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusFilter}
                    >
                      <SelectTrigger className="w-40">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="pending_transfer">
                          Transferring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={handleSort}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="expiryDate">Expiration</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="registrationDate">
                          Registration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => fetchDomains()}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span className="text-lg">Loading domains...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Domains List */}
            {!loading && !error && (
              <div className="space-y-4">
                {domains.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No domains found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {filters.search || filters.status !== "all"
                          ? "Try adjusting your search or filter criteria."
                          : "Get started by registering your first domain."}
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Register Domain
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  domains.map((domain) => {
                    const daysRemaining = getDaysRemaining(domain.expiryDate);

                    return (
                      <Card key={domain.id} className="shadow-md">
                        <Collapsible>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <CollapsibleTrigger
                                className="flex items-center space-x-4 flex-1 text-left"
                                onClick={() => toggleDomainExpansion(domain.id)}
                              >
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Globe className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left flex-1">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {domain.name}
                                  </h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <p className="body-sm text-gray-600">
                                      Expires: {formatDate(domain.expiryDate)}
                                    </p>
                                    <span
                                      className={`body-sm ${getDaysRemainingColor(daysRemaining)}`}
                                    >
                                      ({daysRemaining} days remaining)
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(domain.status)}
                                      <span className="text-sm text-gray-600">
                                        {domain.registrar}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-auto">
                                  {expandedDomain === domain.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </div>
                              </CollapsibleTrigger>

                              <div className="flex items-center space-x-3 ml-4">
                                <Badge
                                  variant={getStatusColor(domain.status)}
                                  className="capitalize"
                                >
                                  {domain.status.replace("_", " ")}
                                </Badge>
                                <div className="flex items-center space-x-2">
                                  <Label
                                    htmlFor={`auto-renew-${domain.id}`}
                                    className="body-sm text-gray-600 cursor-pointer"
                                  >
                                    Auto-renew
                                  </Label>
                                  <Switch
                                    id={`auto-renew-${domain.id}`}
                                    checked={domain.autoRenew}
                                    onCheckedChange={() =>
                                      toggleAutoRenew(domain.id)
                                    }
                                  />
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Manage
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Transfer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Renew
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>

                          {/* Expanded Domain Details */}
                          <CollapsibleContent>
                            {expandedDomain === domain.id && (
                              <CardContent className="pt-0 space-y-6">
                                <div className="border-t pt-6">
                                  {/* Registration Details Panel */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center">
                                          <Globe className="mr-2 h-4 w-4" />
                                          Registration Details
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="body-sm text-gray-600">
                                            Registrar:
                                          </span>
                                          <span className="body-sm font-medium">
                                            {domain.registrar}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="body-sm text-gray-600">
                                            Registration Date:
                                          </span>
                                          <span className="body-sm font-medium">
                                            {formatDate(
                                              domain.registrationDate,
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="body-sm text-gray-600">
                                            DNS Provider:
                                          </span>
                                          <span className="body-sm font-medium">
                                            {domain.dnsProvider}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="body-sm text-gray-600">
                                            Domain Lock:
                                          </span>
                                          <div className="flex items-center space-x-2">
                                            {domain.locked ? (
                                              <Lock className="h-4 w-4 text-success" />
                                            ) : (
                                              <Unlock className="h-4 w-4 text-warning" />
                                            )}
                                            <span className="body-sm">
                                              {domain.locked
                                                ? "Locked"
                                                : "Unlocked"}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="body-sm text-gray-600">
                                            EPP/Auth Code:
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              setShowAuthCode(
                                                showAuthCode === domain.id
                                                  ? null
                                                  : domain.id,
                                              )
                                            }
                                          >
                                            {showAuthCode === domain.id ? (
                                              <>
                                                <EyeOff className="mr-2 h-4 w-4" />
                                                Hide
                                              </>
                                            ) : (
                                              <>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Reveal
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                        {showAuthCode === domain.id && (
                                          <div className="bg-gray-50 p-3 rounded border">
                                            <code className="body-sm font-mono">
                                              AUTH-CODE-
                                              {domain.id.toUpperCase()}
                                            </code>
                                          </div>
                                        )}
                                        {domain.tags.length > 0 && (
                                          <div>
                                            <span className="body-sm text-gray-600 block mb-2">
                                              Tags:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {domain.tags.map((tag, index) => (
                                                <Badge
                                                  key={index}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {tag}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* Nameserver Management */}
                                    <NameserverManager
                                      domainId={domain.id}
                                      domainName={domain.name}
                                      initialNameservers={domain.nameservers}
                                      onUpdate={(nameservers) =>
                                        handleNameserverUpdate(
                                          domain.id,
                                          nameservers,
                                        )
                                      }
                                      disabled={domain.status !== "active"}
                                    />
                                  </div>

                                  {/* DNS Records Viewer */}
                                  <DNSRecordsViewer
                                    domainId={domain.id}
                                    domainName={domain.name}
                                  />
                                </div>
                              </CardContent>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.totalCount,
                      )}{" "}
                      of {pagination.totalCount} domains
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchDomains({ page: pagination.page - 1 })
                        }
                        disabled={!pagination.hasPrev || loading}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchDomains({ page: pagination.page + 1 })
                        }
                        disabled={!pagination.hasNext || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Other tabs content */}
          <TabsContent value="hosting" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="h3 text-gray-700 mb-2">Hosting Services</h3>
              <p className="body text-gray-600">
                Manage your web hosting and server configurations
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ssl" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="h3 text-gray-700 mb-2">SSL Certificates</h3>
              <p className="body text-gray-600">
                Secure your websites with SSL certificates
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="h3 text-gray-700 mb-2">Email Services</h3>
              <p className="body text-gray-600">
                Configure email accounts and forwarding
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
