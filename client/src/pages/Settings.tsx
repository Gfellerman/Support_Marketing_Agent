import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, CreditCard, Users, Bell, Database, Download, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and platform preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="demo-data">
            <Database className="w-4 h-4 mr-2" />
            Demo Data
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Lacasa Market" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">Contact Email</Label>
                <Input id="org-email" type="email" defaultValue="contact@lacasa.market" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input id="org-website" defaultValue="https://lacasa.market" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure your email sending preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input id="from-name" defaultValue="Lacasa Market" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input id="from-email" type="email" defaultValue="hello@lacasa.market" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-to">Reply-To Email</Label>
                <Input id="reply-to" type="email" defaultValue="support@lacasa.market" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">Growth Plan</h3>
                    <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                  </div>
                  <p className="text-muted-foreground">$99/month • Renews on Feb 15, 2025</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">$99</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contacts</span>
                  <span className="font-medium">2,847 / 10,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Emails Sent</span>
                  <span className="font-medium">45,230 / 100,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Workflows</span>
                  <span className="font-medium">3 / 20</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Upgrade Plan</Button>
                <Button variant="outline">View Billing History</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Choose the plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    name: "Starter",
                    price: "$29",
                    contacts: "1,000",
                    emails: "10,000",
                    workflows: "5",
                  },
                  {
                    name: "Growth",
                    price: "$99",
                    contacts: "10,000",
                    emails: "100,000",
                    workflows: "20",
                    current: true,
                  },
                  {
                    name: "Pro",
                    price: "$299",
                    contacts: "50,000",
                    emails: "500,000",
                    workflows: "Unlimited",
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-4 border rounded-lg ${
                      plan.current ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-4">{plan.price}/mo</p>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li>• {plan.contacts} contacts</li>
                      <li>• {plan.emails} emails/month</li>
                      <li>• {plan.workflows} workflows</li>
                    </ul>
                    <Button
                      variant={plan.current ? "outline" : "default"}
                      className="w-full"
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : "Select Plan"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Doe", email: "john@lacasa.market", role: "Admin" },
                  { name: "Jane Smith", email: "jane@lacasa.market", role: "Agent" },
                  { name: "Bob Wilson", email: "bob@lacasa.market", role: "Agent" },
                ].map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{member.role}</Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "New Tickets",
                    description: "Get notified when new support tickets are created",
                  },
                  {
                    title: "Campaign Completed",
                    description: "Receive alerts when email campaigns finish sending",
                  },
                  {
                    title: "Order Updates",
                    description: "Stay informed about new orders and status changes",
                  },
                  {
                    title: "Weekly Reports",
                    description: "Get weekly performance summaries via email",
                  },
                ].map((notification) => (
                  <div
                    key={notification.title}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium mb-1">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Data Settings */}
        <TabsContent value="demo-data" className="space-y-6">
          <DemoDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DemoDataTab() {
  const seedMutation = trpc.demoData.seed.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Demo data loaded successfully!", {
          description: `Created ${result.data?.contacts} contacts, ${result.data?.campaigns} campaigns, and more.`
        });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error("Failed to load demo data", {
          description: result.error
        });
      }
    },
    onError: (error) => {
      toast.error("Error loading demo data", {
        description: error.message
      });
    }
  });

  const clearMutation = trpc.demoData.clear.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Demo data cleared successfully!");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error("Failed to clear demo data", {
          description: result.error
        });
      }
    },
    onError: (error) => {
      toast.error("Error clearing demo data", {
        description: error.message
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo Data Management</CardTitle>
        <CardDescription>
          Load or clear sample data to explore the platform's capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Load Demo Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Populate your account with realistic sample data including contacts, campaigns, 
              workflows, tickets, and orders. Perfect for testing and exploring features.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">Demo data includes:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>100 contacts across 6 customer segments</li>
                <li>15 email campaigns with performance metrics</li>
                <li>3 email templates</li>
                <li>Sample automation workflows</li>
                <li>Support tickets and order history</li>
              </ul>
            </div>
            <Button 
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Demo Data...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Load Demo Data
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Clear Demo Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Remove all demo data from your account. This action cannot be undone.
            </p>
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to clear all demo data? This action cannot be undone.")) {
                  clearMutation.mutate();
                }
              }}
              disabled={clearMutation.isPending}
            >
              {clearMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing Data...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Demo Data
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
