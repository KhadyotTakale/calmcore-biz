import React, { memo, Suspense, lazy } from "react";
import { FileText, TrendingUp, Shield, Zap } from "lucide-react";

// Lazy load Clerk components (saves ~100KB on initial load)
const SignIn = lazy(() =>
  import("@clerk/clerk-react").then((m) => ({ default: m.SignIn }))
);
const SignUp = lazy(() =>
  import("@clerk/clerk-react").then((m) => ({ default: m.SignUp }))
);

// Custom hook for media query (memoized)
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(
    () => window.matchMedia(query).matches
  );

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

// Memoized loading spinner
const AuthLoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
));

AuthLoadingSpinner.displayName = "AuthLoadingSpinner";

// Memoized feature card component
const FeatureCard = memo(
  ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
  }) => (
    <div className="feature-card">
      <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
);

FeatureCard.displayName = "FeatureCard";

// Memoized features section (never changes)
const FeaturesSection = memo(() => {
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
    <div className="space-y-8">
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
          <span className="gradient-text">Like a Pro</span>
        </h2>
        <p className="text-muted-foreground">
          Create estimates, generate invoices, and track your business growth -
          all in one place.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      {/* Social Proof */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="h-10 w-10 rounded-full border-2 border-card bg-gradient-to-br from-primary/20 to-success/20" />
            <div className="h-10 w-10 rounded-full border-2 border-card bg-gradient-to-br from-primary/20 to-success/20" />
            <div className="h-10 w-10 rounded-full border-2 border-card bg-gradient-to-br from-primary/20 to-success/20" />
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
    </div>
  );
});

FeaturesSection.displayName = "FeaturesSection";

// Memoized mode toggle
const ModeToggle = memo(
  ({
    mode,
    onModeChange,
  }: {
    mode: "signin" | "signup";
    onModeChange: (mode: "signin" | "signup") => void;
  }) => (
    <div className="mb-6 flex gap-2 rounded-lg bg-muted p-1">
      <button
        onClick={() => onModeChange("signin")}
        data-active={mode === "signin"}
        className="mode-toggle-btn"
      >
        Sign In
      </button>
      <button
        onClick={() => onModeChange("signup")}
        data-active={mode === "signup"}
        className="mode-toggle-btn"
      >
        Sign Up
      </button>
    </div>
  )
);

ModeToggle.displayName = "ModeToggle";

// Shared Clerk appearance config (extracted to avoid recreation)
const clerkAppearance = {
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
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    formFieldInput:
      "border-input bg-background text-foreground focus:border-primary focus:ring-primary/20",
    formFieldLabel: "text-foreground",
    footerActionLink: "text-primary hover:text-primary/90",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground",
    formFieldSuccessText: "text-success",
    formFieldErrorText: "text-destructive",
    alertText: "text-foreground",
    card__footer: "hidden",
  },
};

// Main Auth component
const Auth = () => {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-screen gap-8 py-12 lg:grid-cols-2 lg:items-center">
          {/* Left Side - Only render on desktop */}
          {isDesktop && (
            <div className="fade-in-fast order-2 lg:order-1">
              <FeaturesSection />
            </div>
          )}

          {/* Right Side - Auth Forms */}
          <div className="fade-in-fast order-1 flex items-center justify-center lg:order-2">
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <ModeToggle mode={mode} onModeChange={setMode} />

                {/* Lazy loaded Clerk components */}
                <div className="clerk-auth-container">
                  <Suspense fallback={<AuthLoadingSpinner />}>
                    {mode === "signin" ? (
                      <SignIn
                        routing="path"
                        path="/auth"
                        signUpUrl="/auth"
                        afterSignInUrl="/home"
                        appearance={clerkAppearance}
                      />
                    ) : (
                      <SignUp
                        routing="path"
                        path="/auth"
                        signInUrl="/auth"
                        afterSignUpUrl="/home"
                        appearance={clerkAppearance}
                      />
                    )}
                  </Suspense>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
