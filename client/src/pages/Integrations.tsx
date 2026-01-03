import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Integrations() {
  const { data: integrations, isLoading } = trpc.integrations.list.useQuery();

  const availableIntegrations = [
    {
      id: "shopify",
      name: "Shopify",
      description: "Sync orders, customers, and products from your Shopify store",
      logo: "🛍️",
      category: "E-commerce",
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      description: "Connect your WordPress WooCommerce store",
      logo: "🔌",
      category: "E-commerce",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Process payments and sync transaction data",
      logo: "💳",
      category: "Payment",
    },
    {
      id: "mailgun",
      name: "Mailgun",
      description: "Send transactional emails through Mailgun",
      logo: "📧",
      category: "Email Service",
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "Send SMS and WhatsApp notifications",
      logo: "📱",
      category: "Messaging",
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 3000+ apps via Zapier",
      logo: "⚡",
      category: "Automation",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your e-commerce platforms and third-party services
          </p>
        </div>
      </div>

      {/* Connected Integrations */}
      {integrations && integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Integrations</CardTitle>
            <CardDescription>Manage your active connections</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg capitalize">
                            {integration.platform}
                          </h3>
                          {getStatusBadge(integration.status)}
                        </div>
                        {integration.status === "active" && integration.lastSyncAt && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Last synced: {new Date(integration.lastSyncAt).toLocaleString()}
                          </p>
                        )}
                        <div className="text-sm text-muted-foreground">
                          <p>Contacts: {integration.syncedContacts.toLocaleString()}</p>
                          <p>Orders: {integration.syncedOrders.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connect new platforms and services to extend functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => {
              const isConnected = integrations?.some(
                (i) => i.platform === integration.id
              );

              return (
                <div
                  key={integration.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{integration.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{integration.name}</h3>
                        {isConnected && (
                          <Badge variant="secondary" className="text-xs">
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {integration.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {isConnected ? (
                      <>
                        <Plug className="h-4 w-4 mr-2" />
                        Configure
                      </>
                    ) : (
                      <>
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>Learn how to set up your integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-semibold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Choose Your Platform</h4>
                <p className="text-sm text-muted-foreground">
                  Select the e-commerce platform or service you want to connect
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-semibold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Authenticate</h4>
                <p className="text-sm text-muted-foreground">
                  Provide your API credentials or OAuth authorization
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-semibold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Configure Sync Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Choose what data to sync and how often
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary font-semibold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Start Syncing</h4>
                <p className="text-sm text-muted-foreground">
                  Your data will automatically sync in the background
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
