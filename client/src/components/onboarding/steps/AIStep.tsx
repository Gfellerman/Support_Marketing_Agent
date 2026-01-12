import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bot, Briefcase, Smile, Coffee, ExternalLink } from "lucide-react";
import type { SetupData } from "../SetupWizard";

interface AIStepProps {
    data: SetupData;
    updateData: (updates: Partial<SetupData>) => void;
}

export function AIStep({ data, updateData }: AIStepProps) {
    const personalities = [
        {
            id: "professional",
            icon: Briefcase,
            title: "Professional",
            description: "Formal and business-like tone",
        },
        {
            id: "friendly",
            icon: Smile,
            title: "Friendly",
            description: "Warm and approachable",
        },
        {
            id: "casual",
            icon: Coffee,
            title: "Casual",
            description: "Relaxed and conversational",
        },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <Bot className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    AI Assistant Settings
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Our AI can automatically respond to customer questions,
                    classify support tickets, and help write marketing emails.
                </p>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                    <Label htmlFor="ai-enabled" className="font-medium">Enable AI Features</Label>
                    <p className="text-sm text-gray-500">
                        Smart responses, ticket classification, and content suggestions
                    </p>
                </div>
                <Switch
                    id="ai-enabled"
                    checked={data.aiEnabled}
                    onCheckedChange={(checked) => updateData({ aiEnabled: checked })}
                />
            </div>

            {data.aiEnabled && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    {/* API Key */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="groq-key">AI Connection Key</Label>
                            <a
                                href="https://console.groq.com/keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                                Get a free key
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <Input
                            id="groq-key"
                            type="password"
                            placeholder="gsk_xxxxxxxxxxxxxxxx"
                            value={data.groqApiKey}
                            onChange={(e) => updateData({ groqApiKey: e.target.value })}
                            className="h-12 font-mono"
                        />
                        <p className="text-sm text-gray-500">
                            We use Groq for fast AI responses. The free tier is generous for most businesses.
                        </p>
                    </div>

                    {/* Personality Selection */}
                    <div className="space-y-3">
                        <Label>How should the AI sound?</Label>
                        <RadioGroup
                            value={data.aiPersonality}
                            onValueChange={(value: "professional" | "friendly" | "casual") =>
                                updateData({ aiPersonality: value })
                            }
                            className="grid grid-cols-3 gap-3"
                        >
                            {personalities.map((personality) => (
                                <label
                                    key={personality.id}
                                    htmlFor={personality.id}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${data.aiPersonality === personality.id
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <RadioGroupItem
                                        value={personality.id}
                                        id={personality.id}
                                        className="sr-only"
                                    />
                                    <personality.icon
                                        className={`w-6 h-6 ${data.aiPersonality === personality.id
                                                ? "text-green-600"
                                                : "text-gray-400"
                                            }`}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{personality.title}</p>
                                        <p className="text-xs text-gray-500">{personality.description}</p>
                                    </div>
                                </label>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
            )}

            {!data.aiEnabled && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-amber-800">
                        You can always enable AI features later in Settings → AI Assistant
                    </p>
                </div>
            )}
        </div>
    );
}
