import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Ticket as TicketIcon, Mail, MessageSquare, Phone, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { AIAssistDialog } from "@/components/AIAssistDialog";
import { AIClassificationBadge } from "@/components/ai";
import { toast } from "sonner";

export default function Tickets() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "resolved" | "closed">("all");
  const { data: tickets, isLoading } = trpc.tickets.list.useQuery({ status: statusFilter });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return Mail;
      case "chat":
        return MessageSquare;
      case "phone":
        return Phone;
      default:
        return TicketIcon;
    }
  };

  const handleAIAssist = (ticket: any) => {
    setSelectedTicket(ticket);
    setAiDialogOpen(true);
  };

  const handleResponseSent = () => {
    toast.success("Response Sent", {
      description: "AI-assisted response has been sent to the customer.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer inquiries and support requests
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets?.filter((t) => t.status === "open").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TicketIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets?.filter((t) => t.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <TicketIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TicketIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6/5</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>View and manage customer support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const ChannelIcon = getChannelIcon(ticket.channel);
                    const timeAgo = new Date(ticket.createdAt).toLocaleString();

                    return (
                      <div
                        key={ticket.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm text-muted-foreground">
                                {ticket.ticketNumber}
                              </span>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <ChannelIcon className="h-3 w-3" />
                                <span className="text-xs">{ticket.channel}</span>
                              </div>
                            </div>
                            <h3 className="font-semibold mb-1">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              From: {ticket.contactEmail} • Assigned to: {ticket.assignedTo}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAIAssist(ticket)}
                              className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
                            >
                              <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                              AI Assist
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setLocation(`/tickets/${ticket.id}`)}
                            >
                              View Ticket
                            </Button>
                          </div>
                        </div>

                        {/* AI Classification */}
                        {((ticket as any).aiCategory || (ticket as any).aiPriority || (ticket as any).aiSentiment) && (
                          <div className="mt-2 mb-2">
                            <AIClassificationBadge
                              category={(ticket as any).aiCategory}
                              priority={(ticket as any).aiPriority}
                              sentiment={(ticket as any).aiSentiment}
                              confidence={(ticket as any).aiConfidence ? parseFloat((ticket as any).aiConfidence) : null}
                              compact
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created: {timeAgo}</span>
                          <span>Last updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No {statusFilter !== "all" ? statusFilter : ""} tickets found
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Assist Dialog */}
      {selectedTicket && (
        <AIAssistDialog
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          ticketId={selectedTicket.id}
          subject={selectedTicket.subject}
          message={selectedTicket.message || "No message content available"}
          onResponseSent={handleResponseSent}
        />
      )}
    </div>
  );
}
