/**
 * Quick Actions Bar Component
 * AI-suggested actions for quick ticket resolution
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Zap, 
  RotateCcw, 
  Package, 
  Truck, 
  DollarSign,
  Search,
  MessageSquare,
  FileText,
  ArrowRight
} from "lucide-react";
import { useQuickActions } from "@/hooks/useAI";
import { cn } from "@/lib/utils";

interface QuickActionsBarProps {
  ticketSubject: string;
  ticketContent: string;
  onAction?: (action: string) => void;
  className?: string;
}

const actionIcons: Record<string, typeof Zap> = {
  refund: DollarSign,
  resend: Package,
  track: Truck,
  escalate: ArrowRight,
  respond: MessageSquare,
  search_knowledge: Search,
  create_return: RotateCcw,
  generate_template: FileText,
};

const actionLabels: Record<string, string> = {
  refund: "Process Refund",
  resend: "Resend Order",
  track: "Track Shipment",
  escalate: "Escalate",
  respond: "Quick Reply",
  search_knowledge: "Search KB",
  create_return: "Create Return",
  generate_template: "Use Template",
};

const actionColors: Record<string, string> = {
  refund: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200",
  resend: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
  track: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200",
  escalate: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
  respond: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200",
  search_knowledge: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200",
  create_return: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200",
  generate_template: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200",
};

export function QuickActionsBar({
  ticketSubject,
  ticketContent,
  onAction,
  className,
}: QuickActionsBarProps) {
  const { actions, primaryAction, isLoading } = useQuickActions(ticketSubject, ticketContent);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Quick Actions</span>
            <div className="flex gap-2 ml-auto">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!actions || actions.length === 0) {
    return null;
  }

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {actions.map((action: string) => {
              const Icon = actionIcons[action] || Zap;
              const label = actionLabels[action] || action;
              const colorClass = actionColors[action] || actionColors.respond;
              const isPrimary = action === primaryAction;

              return (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(action)}
                  className={cn(
                    "gap-1.5",
                    colorClass,
                    isPrimary && "ring-2 ring-offset-1 ring-yellow-400"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {isPrimary && (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                      Suggested
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
