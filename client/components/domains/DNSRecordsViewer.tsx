import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Globe,
  SortAsc,
  SortDesc,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useDNSRecords, type DNSRecord } from "@/hooks/useDomains";
import { toast } from "@/hooks/use-toast";

interface DNSRecordsViewerProps {
  domainId: string;
  domainName: string;
}

const DNS_RECORD_TYPES = [
  "all",
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SRV",
];

export default function DNSRecordsViewer({
  domainId,
  domainName,
}: DNSRecordsViewerProps) {
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { records, loading, error, fetchDNSRecords, refetch } =
    useDNSRecords(domainId);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Filter by record type
    if (recordTypeFilter !== "all") {
      filtered = filtered.filter((record) => record.type === recordTypeFilter);
    }

    // Filter by search term
    if (searchFilter) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.name.toLowerCase().includes(search) ||
          record.value.toLowerCase().includes(search) ||
          record.type.toLowerCase().includes(search),
      );
    }

    // Sort records
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof DNSRecord];
      let bValue = b[sortBy as keyof DNSRecord];

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return filtered;
  }, [records, recordTypeFilter, searchFilter, sortBy, sortOrder]);

  const handleRefresh = () => {
    fetchDNSRecords(recordTypeFilter, sortBy);
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Record value copied to clipboard",
      });
    });
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      A: "bg-blue-100 text-blue-800",
      AAAA: "bg-purple-100 text-purple-800",
      CNAME: "bg-green-100 text-green-800",
      MX: "bg-orange-100 text-orange-800",
      TXT: "bg-gray-100 text-gray-800",
      NS: "bg-indigo-100 text-indigo-800",
      SRV: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatTTL = (ttl: number) => {
    if (ttl >= 86400) {
      return `${Math.floor(ttl / 86400)}d`;
    } else if (ttl >= 3600) {
      return `${Math.floor(ttl / 3600)}h`;
    } else if (ttl >= 60) {
      return `${Math.floor(ttl / 60)}m`;
    }
    return `${ttl}s`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            DNS Records for {domainName}
          </CardTitle>
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
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search DNS records..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DNS_RECORD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading DNS records...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {records.length === 0
                    ? "No DNS Records"
                    : "No Matching Records"}
                </h3>
                <p className="text-gray-600">
                  {records.length === 0
                    ? "No DNS records found for this domain."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {filteredRecords.length} of {records.length} records
                  </span>
                  {searchFilter || recordTypeFilter !== "all" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchFilter("");
                        setRecordTypeFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSortToggle("type")}
                        >
                          <div className="flex items-center">
                            Type
                            {sortBy === "type" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-4 w-4" />
                              ) : (
                                <SortDesc className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSortToggle("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {sortBy === "name" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-4 w-4" />
                              ) : (
                                <SortDesc className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSortToggle("ttl")}
                        >
                          <div className="flex items-center">
                            TTL
                            {sortBy === "ttl" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-4 w-4" />
                              ) : (
                                <SortDesc className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Badge className={getRecordTypeColor(record.type)}>
                              {record.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.name || "@"}
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {record.value}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTTL(record.ttl)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.priority || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.value)}
                              title="Copy value"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredRecords.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getRecordTypeColor(record.type)}>
                            {record.type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            Name
                          </div>
                          <div className="font-mono text-sm">
                            {record.name || "@"}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            Value
                          </div>
                          <div className="font-mono text-sm break-all">
                            {record.value}
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              TTL:{" "}
                            </span>
                            {formatTTL(record.ttl)}
                          </div>
                          {record.priority && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Priority:{" "}
                              </span>
                              {record.priority}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
