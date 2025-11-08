import React from "react";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Shield, Zap } from "lucide-react";

const Auth = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");

  // Redirect if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      navigate("/home");
    }
  }, [isSignedIn, navigate]);

  const features = [
    {
      icon: FileText,
      title: "Professional Estimates",
      description: "Create stunning estimates instantly",
    },
    {
      icon: TrendingUp,
      title: "Sales Analytics",
      description: "Track your business growth",
    },
    {
      icon: Shield,
      title: "GST Compliant",
      description: "Generate compliant invoices",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Save hours every week",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-screen gap-8 py-12 lg:grid-cols-2 lg:items-center">
          {/* Left Side - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Logo & Tagline */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-success shadow-sm">
                  <span className="font-heading text-2xl font-bold text-white">
                    E
                  </span>
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold text-foreground">
                    Elegant Pro
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Business Management Suite
                  </p>
                </div>
              </div>
              <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
                Manage Your Business
                <br />
                <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  Like a Pro
                </span>
              </h2>
              <p className="text-muted-foreground">
                Create estimates, generate invoices, and track your business
                growth - all in one place.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-card bg-gradient-to-br from-primary/20 to-success/20"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Join 500+ businesses
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Already managing their operations with Elegant Pro
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                {/* Mode Toggle */}
                <div className="mb-6 flex gap-2 rounded-lg bg-muted p-1">
                  <button
                    onClick={() => setMode("signin")}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      mode === "signin"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      mode === "signup"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Clerk Components with Custom Styling */}
                <div className="clerk-auth-container">
                  {mode === "signin" ? (
                    <SignIn
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "bg-transparent shadow-none",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          socialButtonsBlockButton:
                            "border-border bg-background hover:bg-muted text-foreground",
                          socialButtonsBlockButtonText: "text-foreground",
                          dividerLine: "bg-border",
                          dividerText: "text-muted-foreground",
                          formButtonPrimary:
                            "bg-primary hover:bg-primary/90 text-primary-foreground",
                          formFieldInput:
                            "border-input bg-background text-foreground focus:border-primary focus:ring-primary/20",
                          formFieldLabel: "text-foreground",
                          footerActionLink:
                            "text-primary hover:text-primary/90",
                          identityPreviewText: "text-foreground",
                          identityPreviewEditButton: "text-primary",
                          formFieldInputShowPasswordButton:
                            "text-muted-foreground hover:text-foreground",
                          formFieldSuccessText: "text-success",
                          formFieldErrorText: "text-destructive",
                          alertText: "text-foreground",
                          card__footer: "hidden",
                        },
                      }}
                    />
                  ) : (
                    <SignUp
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          card: "bg-transparent shadow-none",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          socialButtonsBlockButton:
                            "border-border bg-background hover:bg-muted text-foreground",
                          socialButtonsBlockButtonText: "text-foreground",
                          dividerLine: "bg-border",
                          dividerText: "text-muted-foreground",
                          formButtonPrimary:
                            "bg-primary hover:bg-primary/90 text-primary-foreground",
                          formFieldInput:
                            "border-input bg-background text-foreground focus:border-primary focus:ring-primary/20",
                          formFieldLabel: "text-foreground",
                          footerActionLink:
                            "text-primary hover:text-primary/90",
                          identityPreviewText: "text-foreground",
                          identityPreviewEditButton: "text-primary",
                          formFieldInputShowPasswordButton:
                            "text-muted-foreground hover:text-foreground",
                          formFieldSuccessText: "text-success",
                          formFieldErrorText: "text-destructive",
                          alertText: "text-foreground",
                          card__footer: "hidden",
                        },
                      }}
                    />
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>

              {/* Free Trial Badge */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
                  <Zap className="h-4 w-4" />
                  Start your free trial today
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
