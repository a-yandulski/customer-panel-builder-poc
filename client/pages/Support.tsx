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
  const [activeTab, setActiveTab] = useState("overview");
  const [activeView, setActiveView] = useState<"list" | "create" | "conversation">("list");

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveView("conversation");
  };

  const handleCreateTicket = () => {
    setActiveView("create");
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setActiveView("list");
  };

  const handleTicketCreated = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveView("conversation");
  };

  const handleTicketUpdate = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

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

  // Handle conversation view
  if (activeView === "conversation") {
    return (
      <AppShell>
        <TicketConversation
          ticketId={selectedTicket?.id || null}
          onBack={handleBackToList}
          onTicketUpdate={handleTicketUpdate}
        />
      </AppShell>
    );
  }

  // Handle create ticket view
  if (activeView === "create") {
    return (
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
              <p className="text-gray-600 mt-1">
                Get help with your services by creating a support ticket
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              Back to Tickets
            </Button>
          </div>

          <TicketCreateForm
            onTicketCreated={handleTicketCreated}
            onCancel={handleBackToList}
          />
        </div>
      </AppShell>
    );
  }

  // Main tickets list view
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-1">
              Get help with your services, manage support tickets, and browse our knowledge base
            </p>
          </div>
          <Button onClick={handleCreateTicket}>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>

        {/* Support Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tickets */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Tickets</h3>
                <TicketList
                  onTicketSelect={handleTicketSelect}
                  onCreateTicket={handleCreateTicket}
                  compact={true}
                />
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateTicket}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Create New Ticket</p>
                          <p className="text-sm text-gray-600">Get help with your services</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("knowledge")}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Browse Knowledge Base</p>
                          <p className="text-sm text-gray-600">Find answers to common questions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <TicketList
              onTicketSelect={handleTicketSelect}
              onCreateTicket={handleCreateTicket}
            />
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            {/* Search Bar */}
            <Card>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Featured Articles
                </CardTitle>
                <CardDescription>
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
                        className="border hover:shadow-md transition-shadow cursor-pointer"
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
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
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
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {category}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
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
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8 text-center">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here
                  to help you with any questions.
                </p>
                <Button onClick={handleCreateTicket}>
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
