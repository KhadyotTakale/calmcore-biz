import { motion } from "framer-motion";
import {
    Settings,
    User,
    Building2,
    Package,
    FileText,
    Send,
    CheckCircle2,
    ArrowRight,
    HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const GettingStarted = () => {
    const steps = [
        {
            number: 1,
            title: "Set Up Invoice Profile",
            description: "Configure details that appear on your estimates and invoices",
            icon: User,
            color: "from-blue-500 to-blue-600",
            actions: [
                {
                    text: "Go to Settings → Profile",
                    details: "Add company address, contact info, and bank details",
                    link: "/profile"
                },
                {
                    text: "Upload Branding",
                    details: "Add your company logo and signature for documents",
                    link: "/profile"
                },
            ],
        },
        {
            number: 2,
            title: "Shop Configuration",
            description: "Set up your online shop identity and domain",
            icon: Building2,
            color: "from-purple-500 to-purple-600",
            actions: [
                {
                    text: "Go to Settings → Company Info",
                    details: "Set your shop name and custom domain URL",
                    link: "/company-info"
                },
                {
                    text: "Shop Visibility",
                    details: "Manage your shop's public profile and settings",
                    link: "/company-info"
                },
            ],
        },
        {
            number: 3,
            title: "Manage Your Items/Services",
            description: "Create a catalog of products or services you offer",
            icon: Package,
            color: "from-green-500 to-green-600",
            actions: [
                {
                    text: "Go to Settings → Manage Items",
                    details: "Add items with descriptions, prices, and images",
                    link: "/manage-items"
                },
                {
                    text: "Organize your catalog",
                    details: "Keep your most-used items active and ready",
                    link: "/manage-items"
                },
            ],
        },
        {
            number: 4,
            title: "Create Your First Estimate",
            description: "Generate professional estimates for your customers",
            icon: FileText,
            color: "from-orange-500 to-orange-600",
            actions: [
                {
                    text: "Click 'New Estimate' from dashboard",
                    details: "Fill in customer details and select items",
                    link: "/generate-estimate"
                },
                {
                    text: "Add discounts and taxes",
                    details: "Customize pricing as needed",
                    link: "/generate-estimate"
                },
            ],
        },
        {
            number: 5,
            title: "Send to Customer",
            description: "Share estimates via WhatsApp or download as PDF",
            icon: Send,
            color: "from-pink-500 to-pink-600",
            actions: [
                {
                    text: "Click 'Send to Customer'",
                    details: "Share directly via WhatsApp with one click",
                    link: "/estimates"
                },
                {
                    text: "Or download PDF",
                    details: "Save and send via email or other channels",
                    link: "/estimates"
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
            <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/10">
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl mb-3">
                        How to Use
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Follow these simple steps to set up your account and start creating professional estimates and invoices
                    </p>
                </motion.div>

                {/* Quick Start Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground shadow-lg"
                >
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-white/20 p-3">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Quick Setup (5 minutes)</h2>
                            <p className="text-primary-foreground/90">
                                Complete all steps below to unlock the full potential of your estimate and invoice management system.
                                Each step takes just a minute!
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Steps */}
                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all"
                            >
                                {/* Step Number Badge */}
                                <div className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                                    {step.number}
                                </div>

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className={`rounded-xl bg-gradient-to-br ${step.color} p-3 text-white shadow-md`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-foreground mb-1">
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="ml-16 space-y-3">
                                        {step.actions.map((action, actionIndex) => (
                                            <Link
                                                key={actionIndex}
                                                to={action.link}
                                                className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted group/action"
                                            >
                                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 transition-transform group-hover/action:translate-x-1" />
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {action.text}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {action.details}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center"
                >
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        Ready to Get Started?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Head to Settings to begin your setup, or jump straight to creating your first estimate!
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all hover:bg-primary/90"
                        >
                            <Settings className="h-4 w-4" />
                            Go to Settings
                        </Link>
                        <Link
                            to="/generate-estimate"
                            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 font-medium text-secondary-foreground transition-all hover:bg-secondary/90"
                        >
                            <FileText className="h-4 w-4" />
                            Create Estimate
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GettingStarted;
