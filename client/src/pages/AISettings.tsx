import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Sparkles } from "lucide-react";

export default function AISettings() {
  const { data: settings, isLoading, refetch } = trpc.ai.settings.get.useQuery();
  const updateMutation = trpc.ai.settings.update.useMutation();
  const resetMutation = trpc.ai.settings.reset.useMutation();

  const [minConfidence, setMinConfidence] = useState(70);
  const [autoResponseThreshold, setAutoResponseThreshold] = useState(90);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(false);
  const [requireHumanReviewUrgent, setRequireHumanReviewUrgent] = useState(true);
  const [requireHumanReviewNegative, setRequireHumanReviewNegative] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      setMinConfidence(settings.minConfidenceThreshold);
      setAutoResponseThreshold(settings.autoResponseThreshold);
      setAiEnabled(settings.aiEnabled);
      setAutoResponseEnabled(settings.autoResponseEnabled);
      setRequireHumanReviewUrgent(settings.requireHumanReviewUrgent);
      setRequireHumanReviewNegative(settings.requireHumanReviewNegative);
      setHasChanges(false);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        minConfidenceThreshold: minConfidence,
        autoResponseThreshold: autoResponseThreshold,
        aiEnabled,
        autoResponseEnabled,
        requireHumanReviewUrgent,
        requireHumanReviewNegative,
      });
      
      toast.success("AI settings saved successfully");
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
      toast.success("Settings reset to defaults");
      refetch();
    } catch (error) {
      toast.error("Failed to reset settings");
      console.error(error);
    }
  };

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Settings</h1>
          <p className="text-muted-foreground">
            Configure AI assistance behavior and confidence thresholds
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Enablement */}
        <Card>
          <CardHeader>
            <CardTitle>AI Assistance</CardTitle>
            <CardDescription>
              Enable or disable AI-powered features across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-enabled">Enable AI Assistance</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to analyze tickets and suggest responses
                </p>
              </div>
              <Switch
                id="ai-enabled"
                checked={aiEnabled}
                onCheckedChange={(checked) => {
                  setAiEnabled(checked);
                  markChanged();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-response">Enable Auto-Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send AI-generated responses for high-confidence cases
                </p>
              </div>
              <Switch
                id="auto-response"
                checked={autoResponseEnabled}
                disabled={!aiEnabled}
                onCheckedChange={(checked) => {
                  setAutoResponseEnabled(checked);
                  markChanged();
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Confidence Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Confidence Thresholds</CardTitle>
            <CardDescription>
              Set minimum confidence levels for AI suggestions and auto-responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="min-confidence">
                  Minimum Confidence for Suggestions
                </Label>
                <span className="text-sm font-medium text-purple-600">
                  {minConfidence}%
                </span>
              </div>
              <Slider
                id="min-confidence"
                min={0}
                max={100}
                step={5}
                value={[minConfidence]}
                onValueChange={([value]) => {
                  setMinConfidence(value);
                  markChanged();
                }}
                disabled={!aiEnabled}
                className="[&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600"
              />
              <p className="text-sm text-muted-foreground">
                AI suggestions will only appear when confidence is above this threshold
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-threshold">
                  Auto-Response Confidence Threshold
                </Label>
                <span className="text-sm font-medium text-purple-600">
                  {autoResponseThreshold}%
                </span>
              </div>
              <Slider
                id="auto-threshold"
                min={0}
                max={100}
                step={5}
                value={[autoResponseThreshold]}
                onValueChange={([value]) => {
                  setAutoResponseThreshold(value);
                  markChanged();
                }}
                disabled={!aiEnabled || !autoResponseEnabled}
                className="[&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600"
              />
              <p className="text-sm text-muted-foreground">
                Responses will be sent automatically only when confidence exceeds this level
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Human Review Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Human Review Requirements</CardTitle>
            <CardDescription>
              Specify when human review is required regardless of confidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="review-urgent">Require Review for Urgent Tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Always require human review for urgent priority tickets
                </p>
              </div>
              <Switch
                id="review-urgent"
                checked={requireHumanReviewUrgent}
                disabled={!aiEnabled}
                onCheckedChange={(checked) => {
                  setRequireHumanReviewUrgent(checked);
                  markChanged();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="review-negative">Require Review for Negative Sentiment</Label>
                <p className="text-sm text-muted-foreground">
                  Always require human review when negative sentiment is detected
                </p>
              </div>
              <Switch
                id="review-negative"
                checked={requireHumanReviewNegative}
                disabled={!aiEnabled}
                onCheckedChange={(checked) => {
                  setRequireHumanReviewNegative(checked);
                  markChanged();
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reset to Defaults
          </Button>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
