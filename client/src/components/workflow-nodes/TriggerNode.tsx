import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TriggerNode({ data }: NodeProps) {
  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: 'New Subscriber',
      abandoned_cart: 'Cart Abandoned',
      order_confirmation: 'Order Placed',
      shipping: 'Order Shipped',
      custom: 'Custom Event',
    };
    return labels[type] || type;
  };

  return (
    <Card className="min-w-[200px] border-2 border-primary shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">TRIGGER</div>
            <div className="font-semibold">{getTriggerLabel((data as any).triggerType || 'welcome')}</div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </Card>
  );
}
