import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Globe,
  Server,
  Shield,
  Mail,
  Search,
  Filter,
  Settings,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Calendar,
  ExternalLink,
  Save,
  X,
} from "lucide-react";

type DNSRecord = {
  id: string;
  type: string;
  name: string;
  value: string;
  ttl: string;
};

type Domain = {
  id: string;
  name: string;
  status: "Active" | "Expired" | "Pending" | "Pending Transfer";
  expires: string;
  daysRemaining: number;
  autoRenew: boolean;
  registrar: string;
  locked: boolean;
  nameservers: string[];
  dnsRecords: DNSRecord[];
};

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [showAuthCode, setShowAuthCode] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    id: "",
    type: "A",
    name: "",
    value: "",
    ttl: "3600",
  });
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const [domains, setDomains] = useState<Domain[]>([
    {
      id: "1",
      name: "example.com",
      status: "Active",
      expires: "Dec 15, 2024",
      daysRemaining: 8,
      autoRenew: true,
      registrar: "DomainHost",
      locked: true,
      nameservers: ["ns1.domainhost.com", "ns2.domainhost.com"],
      dnsRecords: [
        { id: "1", type: "A", name: "@", value: "192.168.1.1", ttl: "3600" },
        { id: "2", type: "CNAME", name: "www", value: "example.com", ttl: "3600" },
        { id: "3", type: "MX", name: "@", value: "10 mail.example.com", ttl: "3600" },
      ],
    },
    {
      id: "2",
      name: "mysite.org",
      status: "Active",
      expires: "Mar 22, 2025",
      daysRemaining: 98,
      autoRenew: false,
      registrar: "DomainHost",
      locked: false,
      nameservers: ["ns1.domainhost.com", "ns2.domainhost.com"],
      dnsRecords: [
        { id: "4", type: "A", name: "@", value: "192.168.1.2", ttl: "3600" },
        { id: "5", type: "CNAME", name: "www", value: "mysite.org", ttl: "3600" },
      ],
    },
    {
      id: "3",
      name: "business.net",
      status: "Pending Transfer",
      expires: "Jan 5, 2025",
      daysRemaining: 29,
      autoRenew: true,
      registrar: "External",
      locked: true,
      nameservers: ["ns1.external.com", "ns2.external.com"],
      dnsRecords: [],
    },
  ]);

  const toggleDomainExpansion = (domainId: string) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const toggleAutoRenewal = (domainId: string) => {
    setDomains(domains.map(domain =>
      domain.id === domainId ? { ...domain, autoRenew: !domain.autoRenew } : domain
    ));
  };

  const toggleDomainLock = (domainId: string) => {
    setDomains(domains.map(domain =>
      domain.id === domainId ? { ...domain, locked: !domain.locked } : domain
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Expired": return "destructive";
      case "Pending": return "secondary";
      case "Pending Transfer": return "secondary";
      default: return "secondary";
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return "text-error";
    if (days <= 30) return "text-warning";
    return "text-gray-600";
  };

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || domain.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedDomains = [...filteredDomains].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "expiration": return a.daysRemaining - b.daysRemaining;
      case "status": return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  const handleAddRecord = () => {
    const domain = domains.find(d => d.id === expandedDomain);
    if (domain) {
      const recordWithId = { ...newRecord, id: Date.now().toString() };
      setDomains(domains.map(d =>
        d.id === expandedDomain
          ? { ...d, dnsRecords: [...d.dnsRecords, recordWithId] }
          : d
      ));
      setNewRecord({ id: "", type: "A", name: "", value: "", ttl: "3600" });
      setShowAddRecord(false);
    }
  };

  const handleDeleteRecord = (domainId: string, recordId: string) => {
    setDomains(domains.map(domain =>
      domain.id === domainId
        ? { ...domain, dnsRecords: domain.dnsRecords.filter(r => r.id !== recordId) }
        : domain
    ));
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="expiration">Expiration</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domains List */}
            <div className="space-y-4">
              {sortedDomains.map((domain) => (
                <Card key={domain.id} className="shadow-md">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full" onClick={() => toggleDomainExpansion(domain.id)}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-gray-900">{domain.name}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="body-sm text-gray-600">
                                  Expires: {domain.expires}
                                </p>
                                <span className={`body-sm font-medium ${getDaysRemainingColor(domain.daysRemaining)}`}>
                                  ({domain.daysRemaining} days remaining)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusColor(domain.status)}>
                              {domain.status}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`auto-renew-${domain.id}`} className="body-sm text-gray-600">
                                Auto-renew
                              </Label>
                              <Switch
                                id={`auto-renew-${domain.id}`}
                                checked={domain.autoRenew}
                                onCheckedChange={() => toggleAutoRenewal(domain.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Settings className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                            {expandedDomain === domain.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>

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
                                    <span className="body-sm text-gray-600">Registrar:</span>
                                    <span className="body-sm font-medium">{domain.registrar}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="body-sm text-gray-600">Registration Date:</span>
                                    <span className="body-sm font-medium">Dec 15, 2022</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="body-sm text-gray-600">Domain Lock:</span>
                                    <div className="flex items-center space-x-2">
                                      {domain.locked ? (
                                        <Lock className="h-4 w-4 text-success" />
                                      ) : (
                                        <Unlock className="h-4 w-4 text-warning" />
                                      )}
                                      <Switch
                                        checked={domain.locked}
                                        onCheckedChange={() => toggleDomainLock(domain.id)}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="body-sm text-gray-600">EPP/Auth Code:</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowAuthCode(showAuthCode === domain.id ? null : domain.id)}
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
                                      <code className="body-sm font-mono">AUTH-CODE-12345678</code>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Nameserver Management */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center">
                                    <Server className="mr-2 h-4 w-4" />
                                    Nameservers
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  {domain.nameservers.map((ns, index) => (
                                    <div key={index}>
                                      <Label className="body-sm text-gray-600">
                                        Nameserver {index + 1}
                                      </Label>
                                      <Input value={ns} className="mt-1" />
                                    </div>
                                  ))}
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Nameserver
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>

                            {/* DNS Records Table */}
                            <Card>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle>DNS Records</CardTitle>
                                  <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
                                    <DialogTrigger asChild>
                                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Record
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Add DNS Record</DialogTitle>
                                        <DialogDescription>
                                          Create a new DNS record for {domain.name}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Record Type</Label>
                                          <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value})}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="A">A</SelectItem>
                                              <SelectItem value="AAAA">AAAA</SelectItem>
                                              <SelectItem value="CNAME">CNAME</SelectItem>
                                              <SelectItem value="MX">MX</SelectItem>
                                              <SelectItem value="TXT">TXT</SelectItem>
                                              <SelectItem value="NS">NS</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Name</Label>
                                          <Input
                                            value={newRecord.name}
                                            onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                                            placeholder="@, www, mail, etc."
                                          />
                                        </div>
                                        <div>
                                          <Label>Value</Label>
                                          <Input
                                            value={newRecord.value}
                                            onChange={(e) => setNewRecord({...newRecord, value: e.target.value})}
                                            placeholder="192.168.1.1, example.com, etc."
                                          />
                                        </div>
                                        <div>
                                          <Label>TTL (seconds)</Label>
                                          <Input
                                            value={newRecord.ttl}
                                            onChange={(e) => setNewRecord({...newRecord, ttl: e.target.value})}
                                          />
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button onClick={handleAddRecord} className="flex-1">
                                            Add Record
                                          </Button>
                                          <Button variant="outline" onClick={() => setShowAddRecord(false)} className="flex-1">
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Value</TableHead>
                                      <TableHead>TTL</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {domain.dnsRecords.map((record) => (
                                      <TableRow key={record.id}>
                                        <TableCell>
                                          <Badge variant="outline">{record.type}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono body-sm">{record.name}</TableCell>
                                        <TableCell className="font-mono body-sm">{record.value}</TableCell>
                                        <TableCell className="body-sm">{record.ttl}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex items-center justify-end space-x-2">
                                            <Button variant="ghost" size="sm">
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              onClick={() => handleDeleteRecord(domain.id, record.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-error" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                {domain.dnsRecords.length === 0 && (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No DNS records found. Add your first record above.</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </CardContent>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs content remains the same but with updated styling */}
          <TabsContent value="hosting" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="h3 text-gray-700 mb-2">Hosting Services</h3>
              <p className="body text-gray-600">Manage your web hosting and server configurations</p>
            </div>
          </TabsContent>

          <TabsContent value="ssl" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="h3 text-gray-700 mb-2">SSL Certificates</h3>
              <p className="body text-gray-600">Secure your websites with SSL certificates</p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="h3 text-gray-700 mb-2">Email Services</h3>
              <p className="body text-gray-600">Configure email accounts and forwarding</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Domain Actions Bar - Fixed bottom */}
        {selectedDomains.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
            <div className="container mx-auto flex items-center justify-between">
              <span className="body text-gray-600">
                {selectedDomains.length} domain(s) selected
              </span>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Transfer Domain
                </Button>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Renew Now
                </Button>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Update Contact Info
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
