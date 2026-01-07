/**
 * AI Response Panel Component
 * Shows AI-suggested responses with multiple tone options
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  BookOpen,
  Briefcase,
  Heart,
  Users
} from "lucide-react";
import { useAIResponses } from "@/hooks/useAI";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIResponsePanelProps {
  ticketId?: string;
  ticketSubject: string;
  ticketContent: string;
  customerId?: string;
  orderNumber?: string;
  onInsertResponse?: (content: string) => void;
  onSendResponse?: (content: string) => void;
  useKnowledge?: boolean;
  className?: string;
}

type Tone = 'professional' | 'friendly' | 'empathetic';

interface GeneratedResponse {
  content: string;
  tone: Tone;
  confidence: number;
  knowledgeSourcesUsed?: string[];
}

export function AIResponsePanel({
  ticketId,
  ticketSubject,
  ticketContent,
  customerId,
  orderNumber,
  onInsertResponse,
  onSendResponse,
  useKnowledge = true,
  className,
}: AIResponsePanelProps) {
  const [responses, setResponses] = useState<Record<Tone, GeneratedResponse | null>>({
    professional: null,
    friendly: null,
    empathetic: null,
  });
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { generateMultipleWithKnowledge, generateMultiple, isGeneratingMultiple } = useAIResponses();

  const generateResponses = async () => {
    try {
      const generateFn = useKnowledge ? generateMultipleWithKnowledge : generateMultiple;
      const result = await generateFn({
        ticketId,
        ticketSubject,
        ticketContent,
        customerId,
        orderNumber,
      });

      const newResponses: Record<Tone, GeneratedResponse | null> = {
        professional: null,
        friendly: null,
        empathetic: null,
      };
      
      // Handle both array and object response formats
      if ('responses' in result && Array.isArray(result.responses)) {
        result.responses.forEach((r: any) => {
          newResponses[r.tone as Tone] = r;
        });
      } else {
        // Object format with tone keys
        (['professional', 'friendly', 'empathetic'] as Tone[]).forEach((tone) => {
          if ((result as any)[tone]) {
            newResponses[tone] = (result as any)[tone];
          }
        });
      }
      
      setResponses(newResponses);
      setHasGenerated(true);
    } catch (error) {
      console.error('Failed to generate responses:', error);
      toast.error('Failed to generate AI responses');
    }
  };

  const handleCopy = () => {
    const response = responses[selectedTone];
    if (response) {
      navigator.clipboard.writeText(response.content);
      setCopied(true);
      toast.success('Response copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    const response = responses[selectedTone];
    if (response && onInsertResponse) {
      onInsertResponse(response.content);
      toast.success('Response inserted');
    }
  };

  const handleSend = () => {
    const response = responses[selectedTone];
    if (response && onSendResponse) {
      onSendResponse(response.content);
    }
  };

  const currentResponse = responses[selectedTone];

  const toneIcons = {
    professional: Briefcase,
    friendly: Users,
    empathetic: Heart,
  };

  const toneLabels = {
    professional: 'Professional',
    friendly: 'Friendly',
    empathetic: 'Empathetic',
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Suggested Response
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateResponses}
            disabled={isGeneratingMultiple}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isGeneratingMultiple && "animate-spin")} />
            {hasGenerated ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated && !isGeneratingMultiple ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click Generate to get AI-suggested responses</p>
          </div>
        ) : isGeneratingMultiple ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        ) : (
          <Tabs value={selectedTone} onValueChange={(v) => setSelectedTone(v as Tone)}>
            <TabsList className="grid w-full grid-cols-3">
              {(['professional', 'friendly', 'empathetic'] as Tone[]).map((tone) => {
                const Icon = toneIcons[tone];
                return (
                  <TabsTrigger key={tone} value={tone} className="text-xs sm:text-sm">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {toneLabels[tone]}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(['professional', 'friendly', 'empathetic'] as Tone[]).map((tone) => (
              <TabsContent key={tone} value={tone} className="mt-4">
                {responses[tone] ? (
                  <div className="space-y-4">
                    {/* Confidence Score */}
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant={responses[tone]!.confidence >= 0.8 ? 'default' : 'secondary'}>
                              {Math.round(responses[tone]!.confidence * 100)}% confidence
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            AI confidence in this response being appropriate
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Knowledge Sources */}
                      {responses[tone]!.knowledgeSourcesUsed && 
                       responses[tone]!.knowledgeSourcesUsed!.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="gap-1">
                                <BookOpen className="h-3 w-3" />
                                {responses[tone]!.knowledgeSourcesUsed!.length} sources
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium mb-1">Knowledge sources used:</p>
                              <ul className="text-xs">
                                {responses[tone]!.knowledgeSourcesUsed!.map((source, i) => (
                                  <li key={i}>• {source}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {/* Response Content */}
                    <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {responses[tone]!.content}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy
                      </Button>
                      {onInsertResponse && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleInsert}
                        >
                          Insert
                        </Button>
                      )}
                      {onSendResponse && (
                        <Button
                          size="sm"
                          onClick={handleSend}
                          className="ml-auto"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Response
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No response generated for this tone</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
