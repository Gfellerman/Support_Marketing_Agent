/**
 * AI Feedback Buttons Component
 * One-click thumbs up/down feedback on AI responses
 */

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { trpc } from "../../_core/trpc";

interface AIFeedbackButtonsProps {
  interactionId: number;
  originalResponse: string;
  category?: string;
  tone?: string;
  onFeedbackSubmit?: (rating: "positive" | "negative") => void;
  className?: string;
  size?: "sm" | "default";
}

export function AIFeedbackButtons({
  interactionId,
  originalResponse,
  category,
  tone,
  onFeedbackSubmit,
  className,
  size = "sm",
}: AIFeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  
  const submitFeedback = trpc.ai.feedback.submit.useMutation({
    onSuccess: (_, variables) => {
      setFeedback(variables.rating);
      onFeedbackSubmit?.(variables.rating);
    },
  });

  const handleFeedback = (rating: "positive" | "negative") => {
    if (feedback) return; // Already submitted
    
    submitFeedback.mutate({
      interactionId,
      rating,
      originalResponse,
      category,
      tone,
    });
  };

  const isLoading = submitFeedback.isPending;
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "h-7 px-2 gap-1",
          feedback === "positive" && "bg-green-100 text-green-700 hover:bg-green-100"
        )}
        onClick={() => handleFeedback("positive")}
        disabled={isLoading || feedback !== null}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSize, "animate-spin")} />
        ) : feedback === "positive" ? (
          <Check className={iconSize} />
        ) : (
          <ThumbsUp className={iconSize} />
        )}
        {size !== "sm" && <span>Helpful</span>}
      </Button>
      
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "h-7 px-2 gap-1",
          feedback === "negative" && "bg-red-100 text-red-700 hover:bg-red-100"
        )}
        onClick={() => handleFeedback("negative")}
        disabled={isLoading || feedback !== null}
      >
        {feedback === "negative" ? (
          <Check className={iconSize} />
        ) : (
          <ThumbsDown className={iconSize} />
        )}
        {size !== "sm" && <span>Not helpful</span>}
      </Button>
      
      {feedback && (
        <span className="text-xs text-muted-foreground ml-1">Thanks!</span>
      )}
    </div>
  );
}

export default AIFeedbackButtons;
