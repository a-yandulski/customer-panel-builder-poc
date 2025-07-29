import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Server, Shield, Settings, Plus } from "lucide-react";

export default function Services() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Services</h1>
            <p className="body text-gray-600 mt-1">
              Manage your domains, hosting, and security services
            </p>
          </div>
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Services Tabs */}
        <Tabs defaultValue="domains" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="hosting">Hosting</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="domains" className="space-y-4">
            <div className="grid gap-4">
              {[
                { 
                  domain: "example.com", 
                  status: "Active", 
                  expires: "Dec 15, 2024", 
                  autoRenew: true,
                  registrar: "DomainHost"
                },
                { 
                  domain: "mysite.org", 
                  status: "Active", 
                  expires: "Mar 22, 2025", 
                  autoRenew: false,
                  registrar: "DomainHost"
                },
                { 
                  domain: "business.net", 
                  status: "Pending Transfer", 
                  expires: "Jan 5, 2025", 
                  autoRenew: true,
                  registrar: "External"
                },
              ].map((domain, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <Globe className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{domain.domain}</h3>
                          <p className="text-sm text-gray-500">Expires: {domain.expires}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={domain.status === "Active" ? "default" : "secondary"}>
                          {domain.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <span>Auto-renew: {domain.autoRenew ? "Enabled" : "Disabled"}</span>
                      <span>Registrar: {domain.registrar}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hosting" className="space-y-4">
            <div className="grid gap-4">
              {[
                { 
                  name: "Web Hosting Pro", 
                  domain: "example.com", 
                  plan: "Professional", 
                  status: "Active",
                  usage: "2.1 GB / 10 GB"
                },
                { 
                  name: "WordPress Hosting", 
                  domain: "mysite.org", 
                  plan: "Business", 
                  status: "Active",
                  usage: "8.7 GB / 25 GB"
                },
              ].map((hosting, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <Server className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{hosting.name}</h3>
                          <p className="text-sm text-gray-500">{hosting.domain} • {hosting.plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">{hosting.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Storage Usage</span>
                        <span>{hosting.usage}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-primary h-2 rounded-full" 
                          style={{ width: hosting.name === "Web Hosting Pro" ? "21%" : "35%" }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4">
              {[
                { 
                  name: "SSL Certificate", 
                  domain: "example.com", 
                  type: "Extended Validation", 
                  status: "Active",
                  expires: "Dec 15, 2024"
                },
                { 
                  name: "SSL Certificate", 
                  domain: "mysite.org", 
                  type: "Domain Validation", 
                  status: "Active",
                  expires: "Mar 22, 2025"
                },
              ].map((security, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <Shield className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{security.name}</h3>
                          <p className="text-sm text-gray-500">{security.domain} • {security.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">{security.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <span>Expires: {security.expires}</span>
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
