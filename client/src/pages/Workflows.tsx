import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Users, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Workflows() {
  const [, navigate] = useLocation();
  const { data: workflows, isLoading } = trpc.workflows.list.useQuery({ status: 'all' });

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: "Welcome Series",
      abandoned_cart: "Abandoned Cart",
      order_confirmation: "Order Confirmation",
      shipping: "Shipping Update",
      custom: "Custom Trigger",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-orange-100 text-orange-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Workflows</h1>
          <p className="text-muted-foreground mt-2">
            Set up automated email sequences and customer journeys
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/workflows/templates')} variant="outline">
            Browse Templates
          </Button>
          <Button onClick={() => navigate('/workflows/builder')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows?.filter((w) => w.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows?.reduce((sum, w) => sum + w.enrolledCount, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows?.reduce((sum, w) => sum + w.completedCount, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-built Templates</CardTitle>
          <CardDescription>
            Get started quickly with our proven workflow templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Welcome Series",
                description: "Onboard new subscribers with a 3-email sequence",
                icon: "👋",
              },
              {
                name: "Abandoned Cart",
                description: "Recover lost sales with timely reminders",
                icon: "🛒",
              },
              {
                name: "Post-Purchase",
                description: "Follow up after orders and request reviews",
                icon: "📦",
              },
              {
                name: "Re-engagement",
                description: "Win back inactive customers",
                icon: "🎯",
              },
              {
                name: "Birthday Campaign",
                description: "Send personalized birthday offers",
                icon: "🎂",
              },
              {
                name: "Product Launch",
                description: "Announce new products to segments",
                icon: "🚀",
              },
            ].map((template) => (
              <div
                key={template.name}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="text-3xl mb-2">{template.icon}</div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/workflows/builder')}>
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Your Workflows</CardTitle>
          <CardDescription>Manage your active automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : workflows && workflows.length > 0 ? (
            <div className="space-y-4">
              {workflows.map((workflow) => {
                const completionRate =
                  workflow.enrolledCount > 0
                    ? ((workflow.completedCount / workflow.enrolledCount) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={workflow.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Trigger: {getTriggerLabel(workflow.triggerType)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/workflows/builder/${workflow.id}`)}>
                        Edit Workflow
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Enrolled</p>
                        <p className="font-semibold">{workflow.enrolledCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Completed</p>
                        <p className="font-semibold">
                          {workflow.completedCount.toLocaleString()} ({completionRate}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Created</p>
                        <p className="font-semibold">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No workflows yet</p>
              <Button onClick={() => navigate('/workflows/builder')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workflow
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
