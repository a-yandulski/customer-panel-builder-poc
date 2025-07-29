import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Plus, Search, FileText, Clock, AlertCircle } from "lucide-react";

export default function Support() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Support</h1>
            <p className="body text-gray-600 mt-1">
              Get help with your services and manage support tickets
            </p>
          </div>
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>

        {/* Support Tabs */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="create">Create Ticket</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            {/* Tickets Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search tickets..." 
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tickets List */}
            <div className="grid gap-4">
              {[
                { 
                  id: "#12345", 
                  subject: "Domain transfer issue", 
                  status: "Open", 
                  priority: "High",
                  created: "Dec 10, 2024",
                  updated: "Dec 11, 2024",
                  category: "Domains"
                },
                { 
                  id: "#12344", 
                  subject: "Email not working after server migration", 
                  status: "Pending", 
                  priority: "Medium",
                  created: "Dec 8, 2024",
                  updated: "Dec 9, 2024",
                  category: "Email"
                },
                { 
                  id: "#12343", 
                  subject: "SSL certificate installation", 
                  status: "Closed", 
                  priority: "Low",
                  created: "Dec 5, 2024",
                  updated: "Dec 6, 2024",
                  category: "Security"
                },
              ].map((ticket, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                          <p className="text-sm text-gray-500">{ticket.id} • {ticket.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm">
                          <div className="text-gray-900">Created: {ticket.created}</div>
                          <div className="text-gray-500">Updated: {ticket.updated}</div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge 
                            variant={
                              ticket.status === "Open" ? "destructive" : 
                              ticket.status === "Pending" ? "secondary" : "default"
                            }
                          >
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ticket.priority}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue and we'll help you resolve it as quickly as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domains">Domains</SelectItem>
                        <SelectItem value="hosting">Hosting</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Please provide detailed information about your issue, including any error messages and steps you've already tried."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Related Domain/Service (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="example.com">example.com</SelectItem>
                      <SelectItem value="mysite.org">mysite.org</SelectItem>
                      <SelectItem value="business.net">business.net</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-brand-primary hover:bg-brand-primary/90">
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search knowledge base..." 
                className="pl-10"
              />
            </div>

            {/* Popular Articles */}
            <div className="grid gap-4">
              <h3 className="h3 text-gray-900">Popular Articles</h3>
              {[
                { 
                  title: "How to point your domain to our servers", 
                  category: "Domains",
                  readTime: "3 min read",
                  helpful: 45
                },
                { 
                  title: "Setting up email accounts and forwarding", 
                  category: "Email",
                  readTime: "5 min read",
                  helpful: 38
                },
                { 
                  title: "Installing WordPress on your hosting account", 
                  category: "Hosting",
                  readTime: "7 min read",
                  helpful: 52
                },
                { 
                  title: "Understanding SSL certificates and HTTPS", 
                  category: "Security",
                  readTime: "4 min read",
                  helpful: 29
                },
                { 
                  title: "Managing DNS records and subdomains", 
                  category: "Domains",
                  readTime: "6 min read",
                  helpful: 41
                },
              ].map((article, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{article.title}</h4>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                            <span>{article.category}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {article.readTime}
                            </div>
                            <span>•</span>
                            <span>{article.helpful} found helpful</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
