import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle2, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import type { SetupData } from "../SetupWizard";

interface EmailStepProps {
    data: SetupData;
    updateData: (updates: Partial<SetupData>) => void;
}

export function EmailStep({ data, updateData }: EmailStepProps) {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

    const handleTestEmail = async () => {
        setTesting(true);
        setTestResult(null);

        // Simulate email test
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // For demo, assume success if API key looks valid
        if (data.sendgridKey.startsWith("SG.") || data.sendgridKey.length > 20) {
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
                    Configure how your emails will appear to customers.
                    We use SendGrid to ensure your emails reach their inbox.
                </p>
            </div>

            {/* Form */}
            <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="from-name">Your name on emails</Label>
                        <Input
                            id="from-name"
                            placeholder="My Store Team"
                            value={data.fromName}
                            onChange={(e) => updateData({ fromName: e.target.value })}
                            className="h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="from-email">From email address</Label>
                        <Input
                            id="from-email"
                            type="email"
                            placeholder="hello@mystore.com"
                            value={data.fromEmail}
                            onChange={(e) => updateData({ fromEmail: e.target.value })}
                            className="h-12"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reply-to">Reply-to email (where responses go)</Label>
                    <Input
                        id="reply-to"
                        type="email"
                        placeholder="support@mystore.com"
                        value={data.replyToEmail}
                        onChange={(e) => updateData({ replyToEmail: e.target.value })}
                        className="h-12"
                    />
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
                            <a
                                href="https://app.sendgrid.com/settings/api_keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                                Get a free key
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <Input
                            id="sendgrid-key"
                            type="password"
                            placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
                            value={data.sendgridKey}
                            onChange={(e) => {
                                updateData({ sendgridKey: e.target.value, emailConfigured: false });
                                setTestResult(null);
                            }}
                            className="h-12 font-mono"
                        />
                        <p className="text-sm text-gray-500">
                            SendGrid lets you send emails reliably. The free tier includes 100 emails/day.
                        </p>
                    </div>

                    {/* Test button and result */}
                    <div className="mt-4 space-y-3">
                        {testResult === "success" && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Email configured successfully!</span>
                            </div>
                        )}

                        {testResult === "error" && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Couldn't verify the API key. Please check and try again.</span>
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
                                    Test Email Connection
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
