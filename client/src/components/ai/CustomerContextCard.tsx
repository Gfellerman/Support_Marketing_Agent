/**
 * Customer Context Card Component
 * Shows customer value, order history, and VIP status
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Crown, 
  ShoppingBag, 
  DollarSign, 
  Ticket,
  Clock,
  TrendingUp
} from "lucide-react";
import { useCustomerContext, type CustomerContext } from "@/hooks/useAI";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CustomerContextCardProps {
  customerId: string | null;
  className?: string;
}

export function CustomerContextCard({ customerId, className }: CustomerContextCardProps) {
  const { context, isLoading, error } = useCustomerContext(customerId);

  if (!customerId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !context) {
    return null;
  }

  // Cast to any to handle varying response types
  const ctx = context as any;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Context
          </div>
          {ctx.isVIP && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
              <Crown className="h-3 w-3" />
              VIP
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Name */}
        <div className="font-medium text-lg">
          {ctx.name || ctx.customerName || 'Unknown Customer'}
          {ctx.email && (
            <span className="text-sm text-muted-foreground ml-2">{ctx.email}</span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3 w-3" />
              LTV
            </div>
            <div className="font-semibold text-sm">
              {formatCurrency(ctx.lifetimeValue || ctx.ltv || 0)}
            </div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <ShoppingBag className="h-3 w-3" />
              Orders
            </div>
            <div className="font-semibold text-sm">
              {ctx.totalOrders || ctx.orderCount || 0}
            </div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3 w-3" />
              Avg Order
            </div>
            <div className="font-semibold text-sm">
              {formatCurrency(ctx.averageOrderValue || ctx.avgOrderValue || 0)}
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        {(ctx.openTickets || ctx.activeTickets) > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Ticket className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">
              {ctx.openTickets || ctx.activeTickets} open ticket{(ctx.openTickets || ctx.activeTickets) > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Last Order */}
        {(ctx.lastOrderDate || ctx.lastPurchase) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last order: {formatDistanceToNow(new Date(ctx.lastOrderDate || ctx.lastPurchase), { addSuffix: true })}
          </div>
        )}

        {/* Recent Tickets Summary */}
        {ctx.recentTickets && ctx.recentTickets.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Recent Tickets</div>
            <div className="space-y-1">
              {ctx.recentTickets.slice(0, 3).map((ticket: any) => (
                <div key={ticket.id} className="text-xs flex items-center justify-between">
                  <span className="truncate max-w-[70%]">{ticket.subject}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
