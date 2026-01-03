import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ConditionStepNode({ data, selected }: NodeProps) {
  const getConditionLabel = () => {
    const config = data.config as any;
    if (!config?.field || !config?.operator) return 'If/Else Condition';
    return `If ${config.field} ${config.operator} ${config.value || ''}`;
  };

  return (
    <Card className={`min-w-[220px] ${selected ? 'border-2 border-primary shadow-lg' : 'border'}`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <GitBranch className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">CONDITION</div>
            <div className="font-semibold text-sm">{getConditionLabel()}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 text-center">
            <div className="text-xs text-green-600 font-medium">TRUE</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-red-600 font-medium">FALSE</div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '33%' }}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '66%' }}
        className="!bg-red-500"
      />
    </Card>
  );
}
