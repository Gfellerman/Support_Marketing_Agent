import { useState, useCallback, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import StepConfigDialog from '@/components/StepConfigDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Mail, Clock, GitBranch, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import SaveTemplateDialog from '@/components/SaveTemplateDialog';
import type { Node, Edge } from '@xyflow/react';

export default function WorkflowBuilder() {
  const [, params] = useRoute('/workflows/builder/:id?');
  const [, navigate] = useLocation();
  const workflowId = params?.id ? parseInt(params.id) : null;

  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [triggerType, setTriggerType] = useState<string>('welcome');
  const [workflowStatus, setWorkflowStatus] = useState<string>('draft');
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 250, y: 50 },
      data: { triggerType: 'welcome' },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<any[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  // Load existing workflow if editing
  const { data: workflow } = trpc.workflows.get.useQuery(
    { id: workflowId! },
    { enabled: !!workflowId }
  );

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setTriggerType(workflow.triggerType);
      setWorkflowStatus(workflow.status);
      
      // Convert workflow steps to nodes and edges
      const convertedNodes = convertStepsToNodes(workflow.steps || [], workflow.triggerType);
      const convertedEdges = generateEdgesFromNodes(convertedNodes);
      setNodes(convertedNodes);
      setEdges(convertedEdges);
    }
  }, [workflow]);

  const createMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      toast.success('Workflow created successfully!');
      navigate('/workflows');
    },
    onError: (error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });

  const saveTemplateMutation = trpc.templates.save.useMutation({
    onSuccess: () => {
      toast.success('Workflow saved as template!');
      setShowSaveTemplateDialog(false);
      navigate('/workflows/templates');
    },
    onError: (error) => {
      toast.error(`Failed to save template: ${error.message}`);
    },
  });

  const updateMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast.success('Workflow updated successfully!');
      navigate('/workflows');
    },
    onError: (error) => {
      toast.error(`Failed to update workflow: ${error.message}`);
    },
  });

  const validateMutation = trpc.workflows.validate.useMutation({
    onSuccess: (result) => {
      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
      setShowValidation(true);
      
      if (result.isValid) {
        toast.success('Workflow validation passed!');
      } else {
        toast.error(`Validation failed with ${result.errors.length} error(s)`);
      }
    },
    onError: (error) => {
      toast.error(`Validation failed: ${error.message}`);
    },
  });

  const handleValidate = () => {
    // Convert nodes to workflow steps format
    const steps = nodes.map(node => ({
      id: node.id,
      type: node.type === 'trigger' ? 'trigger' : node.type === 'email' ? 'send_email' : node.type,
      config: node.data.config || {},
      next: edges.find(e => e.source === node.id)?.target,
    }));

    validateMutation.mutate({ steps });
  };

  const handleAddStep = (stepType: 'email' | 'delay' | 'condition') => {
    const newNode: Node = {
      id: `step-${Date.now()}`,
      type: stepType,
      position: { x: 250, y: 150 + nodes.length * 100 },
      data: { config: {} },
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeClick = useCallback((node: Node) => {
    if (node.type !== 'trigger') {
      setSelectedNode(node);
      setConfigDialogOpen(true);
    }
  }, []);

  const handleSaveConfig = (nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, config },
          };
        }
        return node;
      })
    );
  };

  const handleSaveWorkflow = () => {
    // Convert nodes and edges to workflow steps format
    const steps = convertNodesToSteps(nodes, edges);

    const workflowData = {
      name: workflowName,
      triggerType: triggerType as any,
      steps,
      status: workflowStatus as any,
    };

    if (workflowId) {
      updateMutation.mutate({
        id: workflowId,
        ...workflowData,
      });
    } else {
      createMutation.mutate(workflowData);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/workflows')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold border-0 focus-visible:ring-0 px-2"
                placeholder="Workflow Name"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={workflowStatus} onValueChange={setWorkflowStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleValidate}
              disabled={nodes.length === 0 || validateMutation.isPending}
            >
              {validationErrors.length > 0 ? (
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              ) : validationWarnings.length > 0 ? (
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Validate
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaveTemplateDialog(true)}
              disabled={nodes.length === 0}
            >
              Save as Template
            </Button>
            <Button onClick={handleSaveWorkflow} disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Results Panel */}
      {showValidation && (validationErrors.length > 0 || validationWarnings.length > 0) && (
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              Validation Results
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowValidation(false)}>
              ×
            </Button>
          </div>
          
          {validationErrors.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <AlertTriangle className="h-4 w-4" />
                {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''}
              </div>
              {validationErrors.map((error, idx) => (
                <div key={idx} className="text-sm bg-red-50 border border-red-200 rounded p-2">
                  {error.stepId && <span className="font-medium">Step {error.stepId}: </span>}
                  {error.message}
                </div>
              ))}
            </div>
          )}
          
          {validationWarnings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-600 font-medium">
                <AlertTriangle className="h-4 w-4" />
                {validationWarnings.length} Warning{validationWarnings.length > 1 ? 's' : ''}
              </div>
              {validationWarnings.map((warning, idx) => (
                <div key={idx} className="text-sm bg-orange-50 border border-orange-200 rounded p-2">
                  {warning.stepId && <span className="font-medium">Step {warning.stepId}: </span>}
                  {warning.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20 p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workflow Trigger</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">New Subscriber</SelectItem>
                  <SelectItem value="abandoned_cart">Cart Abandoned</SelectItem>
                  <SelectItem value="order_confirmation">Order Placed</SelectItem>
                  <SelectItem value="shipping">Order Shipped</SelectItem>
                  <SelectItem value="custom">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddStep('email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddStep('delay')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Add Delay
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddStep('condition')}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>1. Click "Add Steps" to add actions to your workflow</p>
              <p>2. Drag nodes to rearrange them</p>
              <p>3. Connect nodes by dragging from one handle to another</p>
              <p>4. Click on a step to configure it</p>
              <p>5. Save when done</p>
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Step Configuration Dialog */}
      <StepConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        node={selectedNode}
        onSave={handleSaveConfig}
      />

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        open={showSaveTemplateDialog}
        onOpenChange={setShowSaveTemplateDialog}
        defaultName={workflowName}
        onSave={(templateData) => {
          // Get the trigger node
          const triggerNode = nodes.find((n) => n.type === 'trigger');
          if (!triggerNode) {
            toast.error('Workflow must have a trigger node');
            return;
          }

          // Convert nodes to steps
          const steps = nodes
            .filter((n) => n.type !== 'trigger')
            .map((node) => ({
              id: node.id,
              type: node.data.stepType || node.type,
              config: node.data.config || {},
            }));

          saveTemplateMutation.mutate({
            name: templateData.name,
            description: templateData.description,
            category: templateData.category as any,
            tags: templateData.tags,
            icon: templateData.icon,
            triggerType: triggerNode.data.triggerType as any,
            steps,
            isPublic: templateData.isPublic,
          });
        }}
      />
    </div>
  );
}

// Helper functions to convert between workflow steps and nodes/edges
function convertStepsToNodes(steps: any[], triggerType: string): Node[] {
  const nodes: Node[] = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 250, y: 50 },
      data: { triggerType },
    },
  ];

  steps.forEach((step, index) => {
    nodes.push({
      id: step.id,
      type: step.type,
      position: { x: 250, y: 150 + index * 150 },
      data: { config: step.config },
    });
  });

  return nodes;
}

function generateEdgesFromNodes(nodes: Node[]): Edge[] {
  const edges: Edge[] = [];
  
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
    });
  }

  return edges;
}

function convertNodesToSteps(nodes: Node[], edges: Edge[]): any[] {
  // Filter out trigger node
  const stepNodes = nodes.filter((node) => node.type !== 'trigger');

  return stepNodes.map((node) => ({
    id: node.id,
    type: node.type,
    config: node.data.config || {},
  }));
}
