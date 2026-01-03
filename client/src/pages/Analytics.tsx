import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Ticket, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: analytics, isLoading } = trpc.analytics.overview.useQuery({ period: "7d" });

  const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track performance across email, helpdesk, and orders
        </p>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="helpdesk">Helpdesk</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Email Marketing Analytics */}
        <TabsContent value="email" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <MetricCard
                  title="Emails Sent"
                  value={analytics?.emailMetrics.sent.toLocaleString()}
                  icon={Mail}
                />
                <MetricCard
                  title="Open Rate"
                  value={`${analytics?.emailMetrics.openRate}%`}
                  change="+2.5% from last period"
                  trend="up"
                  icon={Mail}
                />
                <MetricCard
                  title="Click Rate"
                  value={`${analytics?.emailMetrics.clickRate}%`}
                  change="+0.8% from last period"
                  trend="up"
                  icon={Mail}
                />
                <MetricCard
                  title="Bounce Rate"
                  value={`${analytics?.emailMetrics.bounceRate}%`}
                  change="-0.2% from last period"
                  trend="up"
                  icon={Mail}
                />
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Performance Trend</CardTitle>
              <CardDescription>Daily emails sent over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.chartData.emailsSent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>By open rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Black Friday Sale", rate: 32.5 },
                    { name: "Welcome Series", rate: 28.3 },
                    { name: "Product Launch", rate: 25.7 },
                  ].map((campaign) => (
                    <div key={campaign.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{campaign.name}</span>
                      <span className="text-sm text-muted-foreground">{campaign.rate}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement by Day</CardTitle>
                <CardDescription>Best days to send emails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: "Tuesday", rate: 26.8 },
                    { day: "Thursday", rate: 25.2 },
                    { day: "Wednesday", rate: 24.1 },
                  ].map((day) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.day}</span>
                      <span className="text-sm text-muted-foreground">{day.rate}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Helpdesk Analytics */}
        <TabsContent value="helpdesk" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <MetricCard
                  title="Total Tickets"
                  value={analytics?.helpdeskMetrics.totalTickets}
                  icon={Ticket}
                />
                <MetricCard
                  title="Resolved"
                  value={analytics?.helpdeskMetrics.resolvedTickets}
                  icon={Ticket}
                />
                <MetricCard
                  title="Avg Response Time"
                  value={analytics?.helpdeskMetrics.avgResponseTime}
                  change="-15min from last period"
                  trend="up"
                  icon={Ticket}
                />
                <MetricCard
                  title="Satisfaction"
                  value={`${analytics?.helpdeskMetrics.satisfactionScore}/5`}
                  change="+0.2 from last period"
                  trend="up"
                  icon={Ticket}
                />
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Volume by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: "Email", count: 89, percentage: 57 },
                    { channel: "Chat", count: 45, percentage: 29 },
                    { channel: "Social", count: 22, percentage: 14 },
                  ].map((item) => (
                    <div key={item.channel}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.channel}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { issue: "Shipping Inquiry", count: 45 },
                    { issue: "Product Questions", count: 32 },
                    { issue: "Return Request", count: 28 },
                  ].map((item) => (
                    <div key={item.issue} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.issue}</span>
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Analytics */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <MetricCard
                  title="Total Orders"
                  value={analytics?.orderMetrics.totalOrders.toLocaleString()}
                  icon={ShoppingCart}
                />
                <MetricCard
                  title="Total Revenue"
                  value={`$${analytics?.orderMetrics.totalRevenue}`}
                  change="+12% from last period"
                  trend="up"
                  icon={ShoppingCart}
                />
                <MetricCard
                  title="Avg Order Value"
                  value={`$${analytics?.orderMetrics.avgOrderValue}`}
                  change="+$3.20 from last period"
                  trend="up"
                  icon={ShoppingCart}
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${analytics?.orderMetrics.conversionRate}%`}
                  change="+0.5% from last period"
                  trend="up"
                  icon={ShoppingCart}
                />
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: "Shopify", orders: 892, percentage: 61 },
                    { platform: "WooCommerce", orders: 564, percentage: 39 },
                  ].map((item) => (
                    <div key={item.platform}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.platform}</span>
                        <span className="text-sm text-muted-foreground">{item.orders}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { product: "Premium Bundle", sales: 234 },
                    { product: "Starter Pack", sales: 189 },
                    { product: "Pro Edition", sales: 156 },
                  ].map((item) => (
                    <div key={item.product} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.product}</span>
                      <span className="text-sm text-muted-foreground">{item.sales} sales</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
