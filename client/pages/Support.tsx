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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Plus,
  Search,
  FileText,
  Clock,
  AlertCircle,
  Star,
  ThumbsUp,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import TicketList from "@/components/support/TicketList";
import TicketCreateForm from "@/components/support/TicketCreateForm";
import TicketConversation from "@/components/support/TicketConversation";
import { type Ticket } from "@/hooks/useSupport";



type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  helpful: number;
  views: number;
  featured: boolean;
};

export default function Support() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  const [tickets] = useState<Ticket[]>([
    {
      id: "TKT-2024-001",
      subject: "Domain transfer issue - example.com not working",
      status: "Open",
      priority: "High",
      category: "Domain",
      created: "Dec 10, 2024",
      updated: "Dec 11, 2024",
      agent: "Sarah Johnson",
      messages: [
        {
          id: "1",
          author: "John Doe",
          authorType: "customer",
          message:
            "I'm having trouble transferring my domain example.com to your service. I initiated the transfer 3 days ago but it's still showing as pending. Can you please help?",
          timestamp: "Dec 10, 2024 9:15 AM",
        },
        {
          id: "2",
          author: "Sarah Johnson",
          authorType: "agent",
          message:
            "Hi John, I've reviewed your domain transfer request. The transfer is currently awaiting authorization from your previous registrar. I've expedited the process and you should receive an authorization email within the next few hours. Please check your email and approve the transfer.",
          timestamp: "Dec 10, 2024 11:30 AM",
        },
        {
          id: "3",
          author: "John Doe",
          authorType: "customer",
          message:
            "Thanks Sarah! I received the email and approved the transfer. How long should I expect it to take now?",
          timestamp: "Dec 10, 2024 2:45 PM",
        },
      ],
    },
    {
      id: "TKT-2024-002",
      subject: "Email not working after server migration",
      status: "In Progress",
      priority: "Normal",
      category: "Technical",
      created: "Dec 8, 2024",
      updated: "Dec 9, 2024",
      agent: "Mike Chen",
      messages: [
        {
          id: "1",
          author: "Jane Smith",
          authorType: "customer",
          message:
            "After the recent server migration, my email accounts aren't working. I can't send or receive emails through Outlook.",
          timestamp: "Dec 8, 2024 3:20 PM",
        },
      ],
    },
    {
      id: "TKT-2024-003",
      subject: "SSL certificate installation completed",
      status: "Solved",
      priority: "Low",
      category: "Technical",
      created: "Dec 5, 2024",
      updated: "Dec 6, 2024",
      agent: "Alex Rivera",
      messages: [
        {
          id: "1",
          author: "Bob Wilson",
          authorType: "customer",
          message:
            "I need help installing an SSL certificate on my website business.net",
          timestamp: "Dec 5, 2024 10:00 AM",
        },
        {
          id: "2",
          author: "Alex Rivera",
          authorType: "agent",
          message:
            "I've successfully installed your SSL certificate. Your website is now secure with HTTPS. Please allow up to 24 hours for full propagation.",
          timestamp: "Dec 5, 2024 2:30 PM",
        },
      ],
    },
  ]);

  const [knowledgeArticles] = useState<KnowledgeArticle[]>([
    {
      id: "1",
      title: "How to point your domain to our servers",
      category: "Domains",
      readTime: "3 min read",
      helpful: 45,
      views: 234,
      featured: true,
    },
    {
      id: "2",
      title: "Setting up email accounts and forwarding",
      category: "Email",
      readTime: "5 min read",
      helpful: 38,
      views: 189,
      featured: true,
    },
    {
      id: "3",
      title: "Installing WordPress on your hosting account",
      category: "Hosting",
      readTime: "7 min read",
      helpful: 52,
      views: 312,
      featured: true,
    },
    {
      id: "4",
      title: "Understanding SSL certificates and HTTPS",
      category: "Security",
      readTime: "4 min read",
      helpful: 29,
      views: 156,
      featured: false,
    },
    {
      id: "5",
      title: "Managing DNS records and subdomains",
      category: "Domains",
      readTime: "6 min read",
      helpful: 41,
      views: 198,
      featured: false,
    },
  ]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "Open":
        return "bg-primary text-white";
      case "In Progress":
        return "bg-warning text-white";
      case "Waiting":
        return "bg-orange-500 text-white";
      case "Solved":
        return "bg-success text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case "Low":
        return "text-gray-600 bg-gray-100";
      case "Normal":
        return "text-blue-600 bg-blue-100";
      case "High":
        return "text-orange-600 bg-orange-100";
      case "Urgent":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleFileUpload = (files: FileList) => {
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedTicket) {
    return (
      <AppShell>
        <div className="space-y-6">
          {/* Ticket Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
              <div>
                <h1 className="h2 text-gray-900">{selectedTicket.subject}</h1>
                <p className="body-sm text-gray-600 mt-1">
                  Ticket {selectedTicket.id} • Created {selectedTicket.created}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(selectedTicket.status)}>
                {selectedTicket.status}
              </Badge>
              <Badge className={getPriorityColor(selectedTicket.priority)}>
                {selectedTicket.priority} Priority
              </Badge>
              {selectedTicket.status !== "Solved" && (
                <Button variant="outline">Close Ticket</Button>
              )}
            </div>
          </div>

          {/* Ticket Info */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="body-sm font-semibold text-gray-700">
                    Category
                  </Label>
                  <p className="body-sm text-gray-900">
                    {selectedTicket.category}
                  </p>
                </div>
                <div>
                  <Label className="body-sm font-semibold text-gray-700">
                    Status
                  </Label>
                  <p className="body-sm text-gray-900">
                    {selectedTicket.status}
                  </p>
                </div>
                <div>
                  <Label className="body-sm font-semibold text-gray-700">
                    Priority
                  </Label>
                  <p className="body-sm text-gray-900">
                    {selectedTicket.priority}
                  </p>
                </div>
                <div>
                  <Label className="body-sm font-semibold text-gray-700">
                    Assigned Agent
                  </Label>
                  <p className="body-sm text-gray-900">
                    {selectedTicket.agent || "Unassigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Thread */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.authorType === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-lg space-y-2 ${
                      message.authorType === "customer"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          message.authorType === "customer"
                            ? "bg-white/20"
                            : "bg-gray-300"
                        }`}
                      >
                        <User className="h-3 w-3" />
                      </div>
                      <span className="body-sm font-semibold">
                        {message.author}
                      </span>
                      <span
                        className={`body-sm ${
                          message.authorType === "customer"
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="body">{message.message}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center space-x-2"
                          >
                            <Paperclip className="h-4 w-4" />
                            <span className="body-sm">{attachment.name}</span>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply Area */}
          {selectedTicket.status !== "Solved" && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Reply to Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                />

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="body-sm text-gray-600 mb-2">
                    Drop files here or click to upload
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) =>
                      e.target.files && handleFileUpload(e.target.files)
                    }
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum 5 files, 5MB each
                  </p>
                </div>

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="body-sm font-semibold">Attachments</Label>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="body-sm">{attachment.name}</span>
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(attachment.size)})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Support Center</h1>
            <p className="body text-gray-600 mt-1">
              Get help with your services, manage support tickets, and browse
              our knowledge base
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setActiveTab("create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>

        {/* Support Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Ticket</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          {/* Create Ticket Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription className="body-sm">
                  Describe your issue and we'll help you resolve it as quickly
                  as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="body-sm font-semibold">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="hosting">Hosting</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="body-sm font-semibold">
                      Priority
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="body-sm font-semibold">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="body-sm font-semibold"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue, including any error messages and steps you've already tried."
                    rows={6}
                  />
                </div>

                {/* File Upload Area */}
                <div className="space-y-2">
                  <Label className="body-sm font-semibold">
                    Attachments (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="body-sm text-gray-600 mb-2">
                      Drop files here or click to upload
                    </p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="ticket-file-upload"
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files)
                      }
                    />
                    <label htmlFor="ticket-file-upload">
                      <Button variant="outline" asChild>
                        <span>Choose Files</span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum 5 files, 5MB each. Supported formats: JPG, PNG,
                      PDF, DOC, TXT
                    </p>
                  </div>
                </div>

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="body-sm font-semibold">
                      Attached Files
                    </Label>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="body-sm font-medium">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {/* Search and Filter */}
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-32">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Waiting">Waiting</SelectItem>
                        <SelectItem value="Solved">Solved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {ticket.subject}
                          </h3>
                          <div className="flex items-center space-x-4 body-sm text-gray-600">
                            <span>#{ticket.id}</span>
                            <span>•</span>
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>Created {ticket.created}</span>
                            {ticket.agent && (
                              <>
                                <span>•</span>
                                <span>Assigned to {ticket.agent}</span>
                              </>
                            )}
                          </div>
                          <p className="body-sm text-gray-500 mt-1">
                            Last updated: {ticket.updated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge
                            className={`${getPriorityColor(ticket.priority)} mt-2`}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          View Conversation
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTickets.length === 0 && (
                <Card className="shadow-md">
                  <CardContent className="pt-12 pb-12 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="h3 text-gray-700 mb-2">No tickets found</h3>
                    <p className="body text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "You haven't created any support tickets yet"}
                    </p>
                    <Button onClick={() => setActiveTab("create")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Ticket
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            {/* Search Bar */}
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search knowledge base..."
                    className="pl-10 text-lg h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Articles */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-warning" />
                  Featured Articles
                </CardTitle>
                <CardDescription className="body-sm">
                  Our most helpful and popular support articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {knowledgeArticles
                    .filter((article) => article.featured)
                    .map((article) => (
                      <Card
                        key={article.id}
                        className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {article.title}
                                </h4>
                                <div className="flex items-center space-x-3 body-sm text-gray-500">
                                  <Badge variant="outline">
                                    {article.category}
                                  </Badge>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {article.readTime}
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <ThumbsUp className="mr-1 h-3 w-3" />
                                    {article.helpful} helpful
                                  </div>
                                  <span>•</span>
                                  <span>{article.views} views</span>
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Browsing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Domains",
                "Hosting",
                "Email",
                "Security",
                "Billing",
                "Technical",
              ].map((category) => (
                <Card
                  key={category}
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {category}
                    </h3>
                    <p className="body-sm text-gray-600 mb-4">
                      {
                        knowledgeArticles.filter((a) => a.category === category)
                          .length
                      }{" "}
                      articles
                    </p>
                    <Button variant="outline" size="sm">
                      Browse {category}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Still Need Help CTA */}
            <Card className="shadow-md bg-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8 text-center">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="h3 text-gray-900 mb-2">Still need help?</h3>
                <p className="body text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here
                  to help you with any questions.
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setActiveTab("create")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Support Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
