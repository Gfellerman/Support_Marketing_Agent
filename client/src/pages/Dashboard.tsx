import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Ticket, ShoppingCart, TrendingUp, Clock, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.dashboard.recentActivity.useQuery();

  const statCards = [
    {
      title: "Total Contacts",
      value: stats?.totalContacts.toLocaleString(),
      icon: Users,
      description: "Active subscribers",
      color: "text-blue-600",
    },
    {
      title: "Email Campaigns",
      value: stats?.totalCampaigns,
      icon: Mail,
      description: "Total campaigns sent",
      color: "text-green-600",
    },
    {
      title: "Open Tickets",
      value: stats?.openTickets,
      icon: Ticket,
      description: "Requiring attention",
      color: "text-orange-600",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      description: "All-time orders",
      color: "text-purple-600",
    },
  ];

  const performanceCards = [
    {
      title: "Emails Sent",
      value: stats?.emailsSentThisMonth.toLocaleString(),
      subtitle: "This month",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Open Rate",
      value: `${stats?.emailOpenRate}%`,
      subtitle: "Average across campaigns",
      icon: Mail,
      color: "text-green-600",
    },
    {
      title: "Response Time",
      value: stats?.avgResponseTime,
      subtitle: "Average ticket response",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Satisfaction",
      value: `${stats?.customerSatisfaction}/5`,
      subtitle: "Customer rating",
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your customer engagement platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </CardHeader>
              </Card>
            ))
          ) : (
            performanceCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${card.color}`} />
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    </div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <CardDescription className="text-xs">{card.subtitle}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activity?.map((item) => {
                  const icons = {
                    campaign: Mail,
                    ticket: Ticket,
                    order: ShoppingCart,
                  };
                  const Icon = icons[item.type as keyof typeof icons];
                  
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="rounded-full bg-muted p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
