import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle } from "lucide-react";
import { WelcomeStep } from "./steps/WelcomeStep";
import { StoreConnectionStep } from "./steps/StoreConnectionStep";
import { EmailStep } from "./steps/EmailStep";
import { AIStep } from "./steps/AIStep";
import { CompletionStep } from "./steps/CompletionStep";

export interface SetupData {
    // Step 1: Account & Organization
    adminName: string;
    password: string;
    organizationName: string;
    contactEmail: string;
    website: string;

    // Step 2: Store
    storeType: "shopify" | "woocommerce" | "none";
    storeUrl: string;
    storeConnected: boolean;

    // Step 3: Email
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
    sendgridKey: string;
    emailConfigured: boolean;

    // Step 4: AI
    aiEnabled: boolean;
    groqApiKey: string;
    aiPersonality: "professional" | "friendly" | "casual";
}

const initialData: SetupData = {
    adminName: "",
    password: "",
    organizationName: "",
    contactEmail: "",
    website: typeof window !== "undefined" ? window.location.origin : "",
    storeType: "none",
    storeUrl: "",
    storeConnected: false,
    fromName: "",
    fromEmail: "",
    replyToEmail: "",
    sendgridKey: "",
    emailConfigured: false,
    aiEnabled: true,
    groqApiKey: "",
    aiPersonality: "friendly",
};

const steps = [
    { id: 1, title: "Welcome", description: "Tell us about your business" },
    { id: 2, title: "Your Store", description: "Connect your online store" },
    { id: 3, title: "Email", description: "Set up email delivery" },
    { id: 4, title: "AI Assistant", description: "Configure smart features" },
    { id: 5, title: "All Done!", description: "You're ready to go" },
];

interface SetupWizardProps {
    onComplete: () => void;
    onSkip?: () => void;
}

export function SetupWizard({ onComplete, onSkip }: SetupWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<SetupData>(initialData);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const progress = (currentStep / steps.length) * 100;

    const updateData = (updates: Partial<SetupData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const registerUser = async () => {
        setRegistering(true);
        setError(null);
        try {
            const response = await fetch('/api/trpc/auth.register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.contactEmail,
                    password: data.password,
                    name: data.adminName,
                    organizationName: data.organizationName,
                }),
                credentials: 'include',
            });

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error.message || 'Registration failed');
            }
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
            return false;
        } finally {
            setRegistering(false);
        }
    };

    const nextStep = async () => {
        // When leaving step 1, register the user
        if (currentStep === 1) {
            // Validate required fields
            if (!data.contactEmail || !data.password || !data.adminName) {
                setError('Please fill in all required fields');
                return;
            }
            if (data.password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }

            const success = await registerUser();
            if (!success) return;
        }

        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleComplete = () => {
        // Save setup data
        localStorage.setItem("setupComplete", "true");
        localStorage.setItem("setupData", JSON.stringify(data));
        onComplete();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <WelcomeStep data={data} updateData={updateData} />;
            case 2:
                return <StoreConnectionStep data={data} updateData={updateData} />;
            case 3:
                return <EmailStep data={data} updateData={updateData} />;
            case 4:
                return <AIStep data={data} updateData={updateData} />;
            case 5:
                return <CompletionStep data={data} onComplete={handleComplete} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-y-auto">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            {/* Main wizard container */}
            <div className="relative w-full max-w-2xl mx-auto my-8 px-4 min-h-screen flex flex-col justify-center">
                {/* Skip button */}
                {onSkip && currentStep < 5 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkip}
                        className="absolute -top-12 right-0 text-white/60 hover:text-white hover:bg-white/10"
                    >
                        Set up later
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}

                {/* Progress section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm font-medium">
                            Step {currentStep} of {steps.length}
                        </span>
                        <span className="text-white/60 text-sm">
                            {steps[currentStep - 1].title}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/20" />
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-8">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${step.id === currentStep
                                ? "bg-white scale-125"
                                : step.id < currentStep
                                    ? "bg-purple-400"
                                    : "bg-white/30"
                                }`}
                        />
                    ))}
                </div>

                {/* Card container */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Step content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-8"
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {currentStep < 5 && (
                        <div className="px-8 py-6 bg-gray-50 border-t space-y-3">
                            {/* Error display */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={currentStep === 1 || registering}
                                    className="gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Back
                                </Button>

                                <Button
                                    onClick={nextStep}
                                    disabled={registering}
                                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                                >
                                    {registering ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            {currentStep === 1 ? "Create Account" : currentStep === 4 ? "Finish Setup" : "Continue"}
                                            <ChevronRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
