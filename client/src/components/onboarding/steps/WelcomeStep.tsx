import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Building2 } from "lucide-react";
import type { SetupData } from "../SetupWizard";

interface WelcomeStepProps {
    data: SetupData;
    updateData: (updates: Partial<SetupData>) => void;
}

export function WelcomeStep({ data, updateData }: WelcomeStepProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome to Support Marketing Agent
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Let's get your account set up in just a few minutes.
                    We'll help you connect your store, configure email, and enable AI features.
                </p>
            </div>

            {/* Form */}
            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="org-name" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        What's your business called?
                    </Label>
                    <Input
                        id="org-name"
                        placeholder="e.g., My Awesome Store"
                        value={data.organizationName}
                        onChange={(e) => updateData({ organizationName: e.target.value })}
                        className="h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact-email">Your email address</Label>
                    <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        value={data.contactEmail}
                        onChange={(e) => updateData({ contactEmail: e.target.value })}
                        className="h-12"
                    />
                    <p className="text-sm text-gray-500">
                        We'll use this to send important updates about your account
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Your website (optional)</Label>
                    <Input
                        id="website"
                        type="url"
                        placeholder="https://yourstore.com"
                        value={data.website}
                        onChange={(e) => updateData({ website: e.target.value })}
                        className="h-12"
                    />
                </div>
            </div>
        </div>
    );
}
