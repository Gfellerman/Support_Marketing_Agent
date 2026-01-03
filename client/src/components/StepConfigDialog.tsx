import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Node } from '@xyflow/react';

interface StepConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node | null;
  onSave: (nodeId: string, config: any) => void;
}

export default function StepConfigDialog({
  open,
  onOpenChange,
  node,
  onSave,
}: StepConfigDialogProps) {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (node?.data?.config) {
      setConfig(node.data.config);
    } else {
      setConfig({});
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(node.id, config);
      onOpenChange(false);
    }
  };

  const renderEmailConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="subject">Subject Line *</Label>
        <Input
          id="subject"
          value={config.subject || ''}
          onChange={(e) => setConfig({ ...config, subject: e.target.value })}
          placeholder="Welcome to {{company_name}}!"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {'{variable}'} for personalization
        </p>
      </div>

      <div>
        <Label htmlFor="fromName">From Name *</Label>
        <Input
          id="fromName"
          value={config.fromName || ''}
          onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
          placeholder="Your Company"
        />
      </div>

      <div>
        <Label htmlFor="fromEmail">From Email *</Label>
        <Input
          id="fromEmail"
          type="email"
          value={config.fromEmail || ''}
          onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
          placeholder="hello@example.com"
        />
      </div>

      <div>
        <Label htmlFor="htmlBody">Email Body (HTML) *</Label>
        <Textarea
          id="htmlBody"
          value={config.htmlBody || ''}
          onChange={(e) => setConfig({ ...config, htmlBody: e.target.value })}
          placeholder="<h1>Welcome {{first_name}}!</h1><p>Thanks for subscribing.</p>"
          rows={8}
        />
      </div>

      <div>
        <Label htmlFor="textBody">Plain Text Version</Label>
        <Textarea
          id="textBody"
          value={config.textBody || ''}
          onChange={(e) => setConfig({ ...config, textBody: e.target.value })}
          placeholder="Welcome! Thanks for subscribing."
          rows={4}
        />
      </div>
    </div>
  );

  const renderDelayConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Wait Duration *</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          value={config.amount || ''}
          onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) })}
          placeholder="24"
        />
      </div>

      <div>
        <Label htmlFor="unit">Time Unit *</Label>
        <Select
          value={config.unit || 'hours'}
          onValueChange={(value) => setConfig({ ...config, unit: value })}
        >
          <SelectTrigger id="unit">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="field">Field to Check *</Label>
        <Input
          id="field"
          value={config.field || ''}
          onChange={(e) => setConfig({ ...config, field: e.target.value })}
          placeholder="contact.orderCount"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Examples: contact.email, contact.orderCount, trigger.cart_total
        </p>
      </div>

      <div>
        <Label htmlFor="operator">Operator *</Label>
        <Select
          value={config.operator || 'equals'}
          onValueChange={(value) => setConfig({ ...config, operator: value })}
        >
          <SelectTrigger id="operator">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Value to Compare *</Label>
        <Input
          id="value"
          value={config.value || ''}
          onChange={(e) => setConfig({ ...config, value: e.target.value })}
          placeholder="0"
        />
      </div>
    </div>
  );

  if (!node) return null;

  const getTitle = () => {
    switch (node.type) {
      case 'email':
        return 'Configure Email Step';
      case 'delay':
        return 'Configure Delay Step';
      case 'condition':
        return 'Configure Condition Step';
      default:
        return 'Configure Step';
    }
  };

  const getDescription = () => {
    switch (node.type) {
      case 'email':
        return 'Set up the email content and sender information';
      case 'delay':
        return 'Define how long to wait before the next step';
      case 'condition':
        return 'Set up a condition to branch the workflow';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {node.type === 'email' && renderEmailConfig()}
          {node.type === 'delay' && renderDelayConfig()}
          {node.type === 'condition' && renderConditionConfig()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
