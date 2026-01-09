/**
 * AI Analytics Dashboard Component
 * Admin dashboard for AI performance monitoring
 */

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Clock,
  Users,
  BookOpen,
  Activity,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

function MetricCard({ title, value, description, icon, trend, trendLabel }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={cn(
              "text-xs",
              trend >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AIAnalyticsDashboard() {
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const { data: dashboard, isLoading: dashboardLoading } = trpc.ai.analytics.dashboard.useQuery(dateRange);
  const { data: categoryData } = trpc.ai.analytics.byCategory.useQuery(dateRange);
  const { data: agentData } = trpc.ai.analytics.agentAdoption.useQuery(dateRange);
  const { data: templates } = trpc.ai.analytics.topTemplates.useQuery({ limit: 5 });
  const { data: kbMetrics } = trpc.ai.analytics.knowledgeBase.useQuery();

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Performance Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor AI response quality and agent adoption
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Responses"
          value={dashboard?.totalResponses.toLocaleString() || "0"}
          description="AI responses generated"
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          title="Usage Rate"
          value={`${dashboard?.usageRate.toFixed(1) || 0}%`}
          description="Responses used by agents"
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Satisfaction Rate"
          value={`${dashboard?.satisfactionRate.toFixed(1) || 0}%`}
          description="Positive feedback rate"
          icon={<ThumbsUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${dashboard?.avgLatencyMs.toFixed(0) || 0}ms`}
          description="Average AI latency"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Responses Used"
          value={dashboard?.responsesUsed.toLocaleString() || "0"}
          description="Without edits"
          icon={<ThumbsUp className="h-4 w-4 text-green-500" />}
        />
        <MetricCard
          title="Responses Edited"
          value={dashboard?.responsesEdited.toLocaleString() || "0"}
          description={`Avg edit distance: ${dashboard?.avgEditDistance.toFixed(0) || 0} chars`}
          icon={<BarChart3 className="h-4 w-4 text-yellow-500" />}
        />
        <MetricCard
          title="Responses Rejected"
          value={dashboard?.responsesRejected.toLocaleString() || "0"}
          description="Not used by agents"
          icon={<ThumbsDown className="h-4 w-4 text-red-500" />}
        />
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="agents">Agent Adoption</TabsTrigger>
          <TabsTrigger value="templates">Top Templates</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>
                AI response quality across different ticket categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData && categoryData.length > 0 ? (
                <div className="space-y-4">
                  {categoryData.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{cat.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {cat.totalResponses} responses
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Usage Rate</div>
                          <Progress value={cat.usageRate} className="h-2" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Satisfaction</div>
                          <Progress value={cat.satisfactionRate} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No category data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Adoption Rates
              </CardTitle>
              <CardDescription>
                How often each agent uses AI-generated responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentData && agentData.length > 0 ? (
                <div className="space-y-4">
                  {agentData.map((agent) => (
                    <div key={agent.agentId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{agent.agentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.responsesUsed} / {agent.totalInteractions} used
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={agent.usageRate} className="w-24 h-2" />
                        <span className="text-sm font-medium w-12">
                          {agent.usageRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No agent data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tones</CardTitle>
              <CardDescription>
                Response tones with highest satisfaction rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates && templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template, idx) => (
                    <div key={template.tone} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={idx === 0 ? "default" : "secondary"}>
                          #{idx + 1}
                        </Badge>
                        <span className="font-medium capitalize">{template.tone}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {template.count} uses
                        </span>
                        <span className="text-green-600">
                          {template.satisfactionRate.toFixed(0)}% satisfied
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No template data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base Stats
              </CardTitle>
              <CardDescription>
                Articles powering RAG responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-4xl font-bold">{kbMetrics?.totalArticles || 0}</p>
                  <p className="text-muted-foreground">Total Active Articles</p>
                </div>
                
                {kbMetrics?.categories && kbMetrics.categories.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Articles by Category</p>
                    <div className="flex flex-wrap gap-2">
                      {kbMetrics.categories.map((cat) => (
                        <Badge key={cat.category} variant="outline">
                          {cat.category}: {cat.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confidence & Tokens */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Confidence</CardTitle>
            <CardDescription>Average confidence score of AI responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={dashboard?.avgConfidence || 0} className="flex-1" />
              <span className="text-xl font-bold">
                {dashboard?.avgConfidence.toFixed(0) || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>Total tokens consumed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {dashboard?.totalTokensUsed.toLocaleString() || "0"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">tokens used</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AIAnalyticsDashboard;
