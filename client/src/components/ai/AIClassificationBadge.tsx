/**
 * AI Classification Badge Component
 * Displays category, priority, and sentiment as color-coded badges
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Tag, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIClassificationBadgeProps {
  category?: string | null;
  priority?: string | null;
  sentiment?: string | null;
  confidence?: number | null;
  showConfidence?: boolean;
  compact?: boolean;
  className?: string;
}

const categoryColors: Record<string, string> = {
  order_status: "bg-blue-100 text-blue-700 border-blue-200",
  shipping: "bg-indigo-100 text-indigo-700 border-indigo-200",
  returns: "bg-purple-100 text-purple-700 border-purple-200",
  product_inquiry: "bg-cyan-100 text-cyan-700 border-cyan-200",
  technical_support: "bg-amber-100 text-amber-700 border-amber-200",
  billing: "bg-emerald-100 text-emerald-700 border-emerald-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
};

const categoryLabels: Record<string, string> = {
  order_status: "Order Status",
  shipping: "Shipping",
  returns: "Returns",
  product_inquiry: "Product",
  technical_support: "Tech Support",
  billing: "Billing",
  general: "General",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-700 border-green-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  negative: "bg-red-100 text-red-700 border-red-200",
  frustrated: "bg-red-100 text-red-700 border-red-200",
};

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="h-3 w-3" />;
    case 'negative':
    case 'frustrated':
      return <TrendingDown className="h-3 w-3" />;
    default:
      return <Minus className="h-3 w-3" />;
  }
};

export function AIClassificationBadge({
  category,
  priority,
  sentiment,
  confidence,
  showConfidence = true,
  compact = false,
  className,
}: AIClassificationBadgeProps) {
  if (!category && !priority && !sentiment) {
    return null;
  }

  const confidencePercent = confidence ? Math.round(confidence * 100) : null;

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        {/* AI Indicator */}
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200 bg-purple-50">
              <Sparkles className="h-3 w-3" />
              {!compact && "AI"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI-classified{confidencePercent && ` (${confidencePercent}% confidence)`}</p>
          </TooltipContent>
        </Tooltip>

        {/* Category Badge */}
        {category && (
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1",
                  categoryColors[category] || categoryColors.general
                )}
              >
                <Tag className="h-3 w-3" />
                {!compact && (categoryLabels[category] || category)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Category: {categoryLabels[category] || category}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Priority Badge */}
        {priority && (
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 capitalize",
                  priorityColors[priority] || priorityColors.medium
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {!compact && priority}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Priority: {priority}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Sentiment Badge */}
        {sentiment && (
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 capitalize",
                  sentimentColors[sentiment] || sentimentColors.neutral
                )}
              >
                <SentimentIcon sentiment={sentiment} />
                {!compact && sentiment}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sentiment: {sentiment}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Confidence Badge */}
        {showConfidence && confidencePercent && !compact && (
          <Badge variant="secondary" className="text-xs">
            {confidencePercent}%
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}
