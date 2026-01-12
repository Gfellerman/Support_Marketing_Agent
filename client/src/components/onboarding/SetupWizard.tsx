import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { WelcomeStep } from "./steps/WelcomeStep";
import { StoreConnectionStep } from "./steps/StoreConnectionStep";
import { EmailStep } from "./steps/EmailStep";
import { AIStep } from "./steps/AIStep";
import { CompletionStep } from "./steps/CompletionStep";

export interface SetupData {
    // Step 1: Organization
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

    const progress = (currentStep / steps.length) * 100;

    const updateData = (updates: Partial<SetupData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
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
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            {/* Main wizard container */}
            <div className="relative w-full max-w-2xl mx-4">
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
                        <div className="px-8 py-6 bg-gray-50 border-t flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>

                            <Button
                                onClick={nextStep}
                                className="gap-2 bg-purple-600 hover:bg-purple-700"
                            >
                                {currentStep === 4 ? "Finish Setup" : "Continue"}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
