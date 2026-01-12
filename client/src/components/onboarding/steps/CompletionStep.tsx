import { Button } from "@/components/ui/button";
import { CheckCircle2, Rocket, BookOpen, Database } from "lucide-react";
import { motion } from "framer-motion";
import type { SetupData } from "../SetupWizard";

interface CompletionStepProps {
    data: SetupData;
    onComplete: () => void;
}

export function CompletionStep({ data, onComplete }: CompletionStepProps) {
    const configuredItems = [
        {
            label: "Organization",
            value: data.organizationName || "Not set",
            configured: !!data.organizationName
        },
        {
            label: "Store Connection",
            value: data.storeConnected
                ? `${data.storeType === "shopify" ? "Shopify" : "WooCommerce"} connected`
                : "Skipped",
            configured: data.storeConnected
        },
        {
            label: "Email Delivery",
            value: data.emailConfigured ? "SendGrid configured" : "Skipped",
            configured: data.emailConfigured
        },
        {
            label: "AI Assistant",
            value: data.aiEnabled
                ? `Enabled (${data.aiPersonality} mode)`
                : "Disabled",
            configured: data.aiEnabled
        },
    ];

    return (
        <div className="space-y-8 py-4">
            {/* Celebration header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white mb-4"
                >
                    <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900">
                        You're All Set! 🎉
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto mt-2">
                        Your Support Marketing Agent is ready to help you
                        engage customers and grow your business.
                    </p>
                </motion.div>
            </div>

            {/* Configuration summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-4 space-y-3"
            >
                <h3 className="font-medium text-gray-900 mb-3">Your Setup Summary</h3>
                {configuredItems.map((item, index) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                    >
                        <span className="text-gray-600">{item.label}</span>
                        <span className={`font-medium ${item.configured ? "text-green-600" : "text-gray-400"
                            }`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
            >
                <Button
                    onClick={onComplete}
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-14 text-lg"
                >
                    <Rocket className="w-5 h-5" />
                    Explore Your Dashboard
                </Button>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                            // Would trigger demo data load
                            onComplete();
                        }}
                    >
                        <Database className="w-4 h-4" />
                        Load Demo Data
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open("/docs", "_blank")}
                    >
                        <BookOpen className="w-4 h-4" />
                        Read the Guide
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
