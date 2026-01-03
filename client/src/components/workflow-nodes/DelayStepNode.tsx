import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DelayStepNode({ data, selected }: NodeProps) {
  const getDelayLabel = () => {
    const config = data.config as any;
    if (!config?.amount || !config?.unit) return 'Wait';
    return `Wait ${config.amount} ${config.unit}`;
  };

  return (
    <Card className={`min-w-[200px] ${selected ? 'border-2 border-primary shadow-lg' : 'border'}`}>
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">DELAY</div>
            <div className="font-semibold text-sm">{getDelayLabel()}</div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </Card>
  );
}
