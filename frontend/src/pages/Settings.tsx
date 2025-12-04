import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Download,
  LogOut,
  ChevronRight,
  CreditCard,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();

      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

      // Navigate to landing page or auth page
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscription = async () => {
    setIsProcessing(true);

    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast({
        title: "Error",
        description:
          "Failed to load payment gateway. Please check your internet connection.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // Razorpay test mode options
    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Replace with YOUR Razorpay test key
      amount: 200000, // Amount in paise (₹99 = 9900 paise)
      currency: "INR",
      name: "Elegant Pro",
      description: "Premium Subscription - Monthly",
      image: "https://cdn-icons-png.flaticon.com/512/2942/2942813.png",
      handler: function (response) {
        // Payment successful
        toast({
          title: "Payment Successful!",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        console.log("Payment Response:", response);
        setIsProcessing(false);
        // Here you would typically:
        // 1. Send payment details to your backend
        // 2. Verify payment signature
        // 3. Update user subscription status
      },
      prefill: {
        name: "Elegant Pro User",
        email: "admin@elegant.com",
        contact: "9999999999",
      },
      notes: {
        subscription_plan: "premium_monthly",
        app_name: "Elegant Pro Estimate Generator",
      },
      theme: {
        color: "#6366f1",
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          console.log("Payment cancelled by user");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Manage your account details",
          onClick: () => navigate("/profile"),
        },
        {
          icon: Building2,
          label: "Company Info",
          description: "Business details and branding",
          onClick: () => navigate("/company-info"),
        },
        {
          icon: Package,
          label: "Manage Items",
          description: "Add and manage inventory items",
          onClick: () => navigate("/manage-items"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage notification settings",
          toggle: true,
          onClick: () => {
            // Toggle functionality
          },
        },
        {
          icon: Palette,
          label: "Theme",
          description: "Customize app appearance",
          onClick: () => {
            // TODO: Navigate to theme settings
            console.log("Navigate to theme");
          },
        },
      ],
    },
    {
      title: "Data & Security",
      items: [
        {
          icon: Shield,
          label: "Security",
          description: "Password and authentication",
          onClick: () => {
            // TODO: Navigate to security settings
            console.log("Navigate to security");
          },
        },
        {
          icon: Download,
          label: "Backup",
          description: "Export and backup data",
          onClick: () => {
            // TODO: Navigate to backup page
            console.log("Navigate to backup");
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-success shadow-primary">
              <span className="font-heading text-2xl font-bold text-white">
                E
              </span>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Elegant Pro
              </h2>
              <p className="text-sm text-muted-foreground">admin@elegant.com</p>
              <div className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Premium Plan
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="p-4">
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </h3>
              </div>
              <Separator />
              <div className="divide-y divide-border">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const Component = item.toggle ? motion.div : motion.button;
                  return (
                    <Component
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05,
                      }}
                      onClick={item.toggle ? undefined : item.onClick}
                      className={`flex w-full items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${
                        !item.toggle ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {item.toggle ? (
                        <Switch />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Component>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscription Info - Now Clickable with Razorpay */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubscription}
          disabled={isProcessing}
          className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-success/5 p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                Premium Subscription
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Unlimited invoices, reports, and multi-user access
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-2xl font-bold text-primary">
                  ₹2000
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground w-fit shadow-sm hover:bg-primary/90 transition-colors">
                <CreditCard className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  {isProcessing ? "Processing..." : "Subscribe Now"}
                </span>
              </div>
            </div>
          </div>
        </motion.button>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-destructive bg-destructive p-4 font-semibold text-white shadow-lg transition-all hover:bg-destructive hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-5 w-5" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
