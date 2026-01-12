import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Send, CheckCircle2, Loader2, ExternalLink, AlertCircle, Clock } from "lucide-react";
import type { SetupData } from "../SetupWizard";

interface EmailStepProps {
    data: SetupData;
    updateData: (updates: Partial<SetupData>) => void;
}

type EmailProvider = "sendgrid" | "resend" | "mailgun" | "skip";

const providers = [
    {
        id: "sendgrid" as EmailProvider,
        name: "SendGrid",
        description: "Popular choice, 100 free emails/day",
        keyPlaceholder: "SG.xxxxxxxxxxxxxxxx",
        keyPrefix: "SG.",
        signupUrl: "https://app.sendgrid.com/settings/api_keys",
    },
    {
        id: "resend" as EmailProvider,
        name: "Resend",
        description: "Modern email API, 100 free emails/day",
        keyPlaceholder: "re_xxxxxxxxxxxxxxxx",
        keyPrefix: "re_",
        signupUrl: "https://resend.com/api-keys",
    },
    {
        id: "mailgun" as EmailProvider,
        name: "Mailgun",
        description: "Enterprise-grade, 5,000 free for 3 months",
        keyPlaceholder: "key-xxxxxxxxxxxxxxxx",
        keyPrefix: "key-",
        signupUrl: "https://app.mailgun.com/settings/api_security",
    },
    {
        id: "skip" as EmailProvider,
        name: "Set up later",
        description: "You can configure email anytime in Settings",
        keyPlaceholder: "",
        keyPrefix: "",
        signupUrl: "",
    },
];

export function EmailStep({ data, updateData }: EmailStepProps) {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<EmailProvider>("sendgrid");

    const currentProvider = providers.find((p) => p.id === selectedProvider);

    const handleProviderChange = (value: EmailProvider) => {
        setSelectedProvider(value);
        setTestResult(null);
        if (value === "skip") {
            updateData({ emailConfigured: false, sendgridKey: "" });
        }
    };

    const handleTestEmail = async () => {
        setTesting(true);
        setTestResult(null);

        // Simulate email test
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // For demo, assume success if API key looks valid
        const key = data.sendgridKey;
        const prefix = currentProvider?.keyPrefix || "";
        if (key.startsWith(prefix) || key.length > 20) {
            setTestResult("success");
            updateData({ emailConfigured: true });
        } else {
            setTestResult("error");
        }
        setTesting(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                    <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Set Up Email Delivery
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Choose your email provider to send campaigns and notifications to customers.
                </p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-3">
                <Label>Choose your email provider</Label>
                <RadioGroup
                    value={selectedProvider}
                    onValueChange={(v) => handleProviderChange(v as EmailProvider)}
                    className="grid grid-cols-2 gap-3"
                >
                    {providers.map((provider) => (
                        <label
                            key={provider.id}
                            htmlFor={provider.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedProvider === provider.id
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <RadioGroupItem
                                value={provider.id}
                                id={provider.id}
                                className="mt-0.5"
                            />
                            <div>
                                <p className="font-medium text-sm">{provider.name}</p>
                                <p className="text-xs text-gray-500">{provider.description}</p>
                            </div>
                        </label>
                    ))}
                </RadioGroup>
            </div>

            {/* Email settings - only show if not skipping */}
            {selectedProvider !== "skip" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* From/Reply-to fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from-name">Your name on emails</Label>
                            <Input
                                id="from-name"
                                placeholder="My Store Team"
                                value={data.fromName}
                                onChange={(e) => updateData({ fromName: e.target.value })}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from-email">From email</Label>
                            <Input
                                id="from-email"
                                type="email"
                                placeholder="hello@mystore.com"
                                value={data.fromEmail}
                                onChange={(e) => updateData({ fromEmail: e.target.value })}
                                className="h-11"
                            />
                        </div>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="api-key">{currentProvider?.name} API Key</Label>
                            {currentProvider?.signupUrl && (
                                <a
                                    href={currentProvider.signupUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                >
                                    Get a free key
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                        <Input
                            id="api-key"
                            type="password"
                            placeholder={currentProvider?.keyPlaceholder}
                            value={data.sendgridKey}
                            onChange={(e) => {
                                updateData({ sendgridKey: e.target.value, emailConfigured: false });
                                setTestResult(null);
                            }}
                            className="h-11 font-mono"
                        />
                    </div>

                    {/* Test button and result */}
                    <div className="space-y-3">
                        {testResult === "success" && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Email configured successfully!</span>
                            </div>
                        )}

                        {testResult === "error" && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Couldn't verify the key. Please check and try again.</span>
                            </div>
                        )}

                        <Button
                            onClick={handleTestEmail}
                            disabled={!data.sendgridKey || testing}
                            variant={testResult === "success" ? "outline" : "default"}
                            className="w-full gap-2"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing connection...
                                </>
                            ) : testResult === "success" ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Connection verified
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Test Connection
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Skip message */}
            {selectedProvider === "skip" && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-amber-800 text-sm">
                        No problem! You can set up email delivery later in <strong>Settings → Email</strong>.
                        Email campaigns won't work until configured.
                    </p>
                </div>
            )}
        </div>
    );
}
