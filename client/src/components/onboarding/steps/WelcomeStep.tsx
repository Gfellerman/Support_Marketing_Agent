import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Building2, Lock, Mail, User } from "lucide-react";
import type { SetupData } from "../SetupWizard";

interface WelcomeStepProps {
    data: SetupData;
    updateData: (updates: Partial<SetupData>) => void;
}

export function WelcomeStep({ data, updateData }: WelcomeStepProps) {
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 text-purple-600 mb-2">
                    <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome! Let's get started
                </h2>
                <p className="text-gray-600 text-sm">
                    Create your admin account to access the dashboard
                </p>
            </div>

            {/* Form */}
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="admin-name" className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        Your name
                    </Label>
                    <Input
                        id="admin-name"
                        placeholder="John Smith"
                        value={data.adminName}
                        onChange={(e) => updateData({ adminName: e.target.value })}
                        className="h-11"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        Email address
                    </Label>
                    <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        value={data.contactEmail}
                        onChange={(e) => updateData({ contactEmail: e.target.value })}
                        className="h-11"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Create a password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={data.password}
                        onChange={(e) => updateData({ password: e.target.value })}
                        className="h-11"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="org-name" className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        Business name (optional)
                    </Label>
                    <Input
                        id="org-name"
                        placeholder="My Awesome Store"
                        value={data.organizationName}
                        onChange={(e) => updateData({ organizationName: e.target.value })}
                        className="h-11"
                    />
                </div>
            </div>
        </div>
    );
}
