import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EmailStepNode({ data, selected }: NodeProps) {
  return (
    <Card className={`min-w-[250px] ${selected ? 'border-2 border-primary shadow-lg' : 'border'}`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground font-medium">EMAIL</div>
            <div className="font-semibold text-sm">
              {(data.config as any)?.subject || 'Send Email'}
            </div>
          </div>
        </div>
        {(data.config as any)?.fromEmail && (
          <div className="text-xs text-muted-foreground">
            From: {(data.config as any).fromEmail}
          </div>
        )}
        {(data.config as any)?.htmlBody && (
          <Badge variant="outline" className="mt-2 text-xs">
            {(data.config as any).htmlBody.length > 50
              ? (data.config as any).htmlBody.substring(0, 50) + '...'
              : (data.config as any).htmlBody}
          </Badge>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </Card>
  );
}
