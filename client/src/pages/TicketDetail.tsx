/**
 * Ticket Detail Page with AI Integration
 * Full-featured ticket view with AI-powered assistance
 */

import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  User,
  Mail,
  MessageSquare,
  Phone,
  Ticket as TicketIcon,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// AI Components
import { 
  AIResponsePanel, 
  AIClassificationBadge, 
  QuickActionsBar, 
  CustomerContextCard,
  KnowledgeSearchModal 
} from "@/components/ai";
import { useTicketClassification } from "@/hooks/useAI";

export default function TicketDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const id = params.id;
  const [replyContent, setReplyContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ticketId = parseInt(id || "0");
  
  // Fetch ticket data - using list query with filter
  const { data: ticketList, isLoading, refetch } = trpc.tickets.list.useQuery(
    { status: 'all' as const },
    { enabled: !!ticketId }
  );
  
  const ticket = ticketList?.find((t: any) => t.id === ticketId);

  // AI Classification hook
  const { classifyById, isClassifying } = useTicketClassification();

  const handleClassify = async () => {
    try {
      await classifyById(ticketId, true);
      refetch();
      toast.success("Ticket classified by AI");
    } catch (error) {
      toast.error("Failed to classify ticket");
    }
  };

  const handleInsertResponse = (content: string) => {
    setReplyContent(prev => prev ? `${prev}\n\n${content}` : content);
    textareaRef.current?.focus();
  };

  const handleSendResponse = (content: string) => {
    // TODO: Implement send response
    toast.success("Response sent successfully");
    setReplyContent("");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'refund':
        toast.info("Opening refund workflow...");
        break;
      case 'track':
        toast.info("Fetching tracking information...");
        break;
      case 'resend':
        toast.info("Initiating resend process...");
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return Mail;
      case "chat": return MessageSquare;
      case "phone": return Phone;
      default: return TicketIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <TicketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
      </div>
    );
  }

  const ChannelIcon = getChannelIcon(ticket.channel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/tickets")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{ticket.ticketNumber}</h1>
              <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
              <Badge variant="outline" className="capitalize">{ticket.priority}</Badge>
            </div>
            <p className="text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClassify}
            disabled={isClassifying}
          >
            <Sparkles className={`h-4 w-4 mr-1 ${isClassifying ? 'animate-spin' : ''}`} />
            {(ticket as any).aiCategory ? 'Re-classify' : 'AI Classify'}
          </Button>
          <KnowledgeSearchModal onInsert={handleInsertResponse} />
        </div>
      </div>

      {/* AI Classification Badge */}
      {((ticket as any).aiCategory || (ticket as any).aiPriority || (ticket as any).aiSentiment) && (
        <AIClassificationBadge
          category={(ticket as any).aiCategory}
          priority={(ticket as any).aiPriority}
          sentiment={(ticket as any).aiSentiment}
          confidence={(ticket as any).aiConfidence ? parseFloat((ticket as any).aiConfidence) : null}
        />
      )}

      {/* Quick Actions */}
      <QuickActionsBar
        ticketSubject={ticket.subject}
        ticketContent={ticket.message || ticket.subject}
        onAction={handleQuickAction}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Details & Reply */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.contactEmail}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ChannelIcon className="h-3 w-3" />
                      <span>via {ticket.channel}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(ticket.createdAt), 'PPp')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">
                  {ticket.message || "No message content"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reply Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                ref={textareaRef}
                placeholder="Type your response..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <KnowledgeSearchModal 
                  onInsert={handleInsertResponse}
                  trigger={
                    <Button variant="outline" size="sm">
                      Insert from Knowledge Base
                    </Button>
                  }
                />
                <Button 
                  disabled={!replyContent.trim()}
                  onClick={() => handleSendResponse(replyContent)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Response Panel */}
          <AIResponsePanel
            ticketId={String(ticket.id)}
            ticketSubject={ticket.subject}
            ticketContent={ticket.message || ticket.subject}
            customerId={(ticket as any).contactId ? String((ticket as any).contactId) : undefined}
            onInsertResponse={handleInsertResponse}
            onSendResponse={handleSendResponse}
            useKnowledge={true}
          />
        </div>

        {/* Right Column - Context & Info */}
        <div className="space-y-6">
          {/* Customer Context */}
          <CustomerContextCard 
            customerId={(ticket as any).contactId ? String((ticket as any).contactId) : null}
          />

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{ticket.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium capitalize">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Channel</p>
                  <p className="font-medium capitalize">{ticket.channel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{ticket.assignedTo || 'Unassigned'}</p>
                </div>
              </div>

              <Separator />

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(ticket.createdAt), 'PPp')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{format(new Date(ticket.updatedAt), 'PPp')}</span>
                </div>
                {(ticket as any).aiClassifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Classified</span>
                    <span>{format(new Date((ticket as any).aiClassifiedAt), 'PPp')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
