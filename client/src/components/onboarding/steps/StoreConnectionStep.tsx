import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Store, ShoppingBag, Globe, CheckCircle2, Loader2 } from "lucide-react";
import type { SetupData } from "../SetupWizard";

interface StoreConnectionStepProps {
    data: SetupData;
    updateData: (updates: Partial<SetupData>) => void;
}

export function StoreConnectionStep({ data, updateData }: StoreConnectionStepProps) {
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);
        // Simulate connection - in real implementation, would call API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        updateData({ storeConnected: true });
        setConnecting(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <Store className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Connect Your Online Store
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Sync your customers, orders, and products automatically.
                    This helps us provide better support and marketing features.
                </p>
            </div>

            {/* Store type selection */}
            <div className="space-y-4 pt-4">
                <Label>What platform is your store on?</Label>
                <RadioGroup
                    value={data.storeType}
                    onValueChange={(value: "shopify" | "woocommerce" | "none") =>
                        updateData({ storeType: value, storeConnected: false })
                    }
                    className="grid grid-cols-1 gap-3"
                >
                    <label
                        htmlFor="shopify"
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${data.storeType === "shopify"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <RadioGroupItem value="shopify" id="shopify" />
                        <ShoppingBag className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="font-medium">Shopify</p>
                            <p className="text-sm text-gray-500">Connect your Shopify store</p>
                        </div>
                    </label>

                    <label
                        htmlFor="woocommerce"
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${data.storeType === "woocommerce"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <RadioGroupItem value="woocommerce" id="woocommerce" />
                        <Globe className="w-6 h-6 text-purple-600" />
                        <div>
                            <p className="font-medium">WooCommerce</p>
                            <p className="text-sm text-gray-500">Connect your WordPress store</p>
                        </div>
                    </label>

                    <label
                        htmlFor="none"
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${data.storeType === "none"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <RadioGroupItem value="none" id="none" />
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">?</span>
                        </div>
                        <div>
                            <p className="font-medium">I'll do this later</p>
                            <p className="text-sm text-gray-500">Skip store connection for now</p>
                        </div>
                    </label>
                </RadioGroup>

                {/* Store URL input */}
                {data.storeType !== "none" && (
                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label htmlFor="store-url">Your store URL</Label>
                            <Input
                                id="store-url"
                                placeholder={
                                    data.storeType === "shopify"
                                        ? "mystore.myshopify.com"
                                        : "https://mystore.com"
                                }
                                value={data.storeUrl}
                                onChange={(e) => updateData({ storeUrl: e.target.value })}
                                className="h-12"
                            />
                        </div>

                        {data.storeConnected ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Store connected successfully!</span>
                            </div>
                        ) : (
                            <Button
                                onClick={handleConnect}
                                disabled={!data.storeUrl || connecting}
                                className="w-full gap-2"
                            >
                                {connecting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>Connect Store</>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
