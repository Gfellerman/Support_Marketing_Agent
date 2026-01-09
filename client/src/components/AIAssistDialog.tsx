import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAssistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number;
  subject: string;
  message: string;
  onResponseSent?: () => void;
}

export function AIAssistDialog({
  open,
  onOpenChange,
  ticketId,
  subject,
  message,
  onResponseSent,
}: AIAssistDialogProps) {
  const [editedResponse, setEditedResponse] = useState("");
  const [classification, setClassification] = useState<any>(null);
  const [suggestedResponse, setSuggestedResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const classifyMutation = trpc.ai.tickets.classify.useMutation();
  const generateMutation = trpc.ai.tickets.generateResponse.useMutation();

  // Process ticket with AI when dialog opens
  const handleProcessTicket = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Step 1: Classify the ticket
      const classificationResult = await classifyMutation.mutateAsync({
        ticketId,
        subject,
        message,
      });
      setClassification(classificationResult);

      // Step 2: Generate response
      const responseResult = await generateMutation.mutateAsync({
        ticketId,
        subject,
        message,
        classification: classificationResult,
      });

      setSuggestedResponse(responseResult.content);
      setEditedResponse(responseResult.content);
    } catch (error) {
      console.error("AI processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger processing when dialog opens
  useEffect(() => {
    if (open && !classification && !isProcessing) {
      handleProcessTicket();
    }
  }, [open]);

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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-700";
      case "neutral":
        return "bg-blue-100 text-blue-700";
      case "negative":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const handleSendResponse = () => {
    // In a real implementation, this would send the response via the tickets API
    // For now, we'll just close the dialog and notify parent
    onResponseSent?.();
    onOpenChange(false);
  };

  const handleClose = () => {
    // Reset state when closing
    setClassification(null);
    setSuggestedResponse("");
    setEditedResponse("");
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Assist - Ticket Analysis & Response
          </DialogTitle>
          <DialogDescription>
            AI-powered ticket classification and suggested response
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Ticket */}
          <div>
            <h3 className="font-semibold mb-2">Original Ticket</h3>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-medium">{subject}</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>

          {/* AI Classification */}
          {isProcessing && !classification && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-3 text-muted-foreground">
                AI is analyzing the ticket...
              </span>
            </div>
          )}

          {classification && (
            <div>
              <h3 className="font-semibold mb-3">AI Classification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="outline" className="text-sm">
                    {classification.category.replace("_", " ")}
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <Badge className={getPriorityColor(classification.priority)}>
                    {classification.priority}
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
                  <Badge className={getSentimentColor(classification.sentiment)}>
                    {classification.sentiment}
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                  <span
                    className={`font-semibold ${getConfidenceColor(
                      classification.confidence
                    )}`}
                  >
                    {(classification.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {classification.confidence < 0.7 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Low confidence detected. Human review recommended before sending.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* AI Suggested Response */}
          {suggestedResponse && (
            <div>
              <h3 className="font-semibold mb-2">AI Suggested Response</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Review and edit the response before sending to the customer
              </p>
              <Textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                rows={8}
                className="font-sans"
                placeholder="AI-generated response will appear here..."
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {suggestedResponse && (
            <>
              <Button
                variant="outline"
                onClick={() => setEditedResponse(suggestedResponse)}
              >
                Reset to Original
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!editedResponse.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Send Response
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
