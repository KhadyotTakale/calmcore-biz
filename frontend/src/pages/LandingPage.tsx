import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Receipt,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Menu,
  X,
  ArrowRight,
  Star,
  Download,
  Smartphone,
  Cloud,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Send,
  Printer,
  Database,
  Lock,
  Headphones,
} from "lucide-react";
import img1 from "../assets/img1.jpeg";
import img2 from "../assets/img2.jpeg";
import img3 from "../assets/img3.jpeg";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: "Professional Estimates",
      description: "Create stunning estimates with your branding",
    },
    {
      icon: Receipt,
      title: "GST Invoices",
      description: "Generate compliant invoices instantly",
    },
    {
      icon: TrendingUp,
      title: "Sales Analytics",
      description: "Track performance with detailed reports",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Organize customer data seamlessly",
    },
    {
      icon: Send,
      title: "WhatsApp Integration",
      description: "Send estimates directly via WhatsApp",
    },
    {
      icon: Download,
      title: "PDF Downloads",
      description: "Export and print professional documents",
    },
    {
      icon: BookOpen,
      title: "Day Book",
      description: "Track daily transactions effortlessly",
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Access your data from anywhere",
    },
  ];

  const planIncludes = [
    "Unlimited Estimates",
    "Unlimited Invoices",
    "GST Compliance",
    "Customer Database",
    "WhatsApp Integration",
    "PDF Export & Print",
    "Sales Reports",
    "Profit & Loss Reports",
    "Day Book Management",
    "Multi-Device Access",
    "Cloud Backup",
    "Priority Support",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header/Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-success shadow-sm">
                <span className="font-heading text-xl font-bold text-white">
                  T
                </span>
              </div>
              <span className="font-heading text-xl font-bold text-foreground">
                Tamhan
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-4 md:flex">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </a>
              <button
                onClick={() => navigate("/auth")}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                Login / Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div
              className="border-t border-border py-4 md:hidden"
            >
              <div className="flex flex-col gap-3">
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Pricing
                </a>
                <button
                  onClick={() => navigate("/auth")}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Login / Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Star className="h-4 w-4 fill-primary" />
              Trusted by Businesses Across India
            </div>
            <h1 className="mb-6 font-heading text-4xl font-bold text-foreground md:text-6xl lg:text-7xl">
              Professional Estimates &<br />
              <span style={{ color: 'hsl(100, 52%, 35%)' }}>
                Invoices in Minutes
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground">
              Create GST-compliant estimates and invoices with ease. Manage your
              business professionally with our all-in-one solution.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#pricing"
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-muted"
              >
                View Pricing
              </a>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Image 1 */}
              <div className="rounded-2xl border border-border bg-card p-3 shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={img1}
                  alt="Professional Business Management"
                  className="w-full h-64 rounded-lg object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="400"
                  height="256"
                />
              </div>

              {/* Image 2 */}
              <div className="rounded-2xl border border-border bg-card p-3 shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={img2}
                  alt="Indian Shop Management"
                  className="w-full h-64 rounded-lg object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="400"
                  height="256"
                />
              </div>

              {/* Image 3 */}
              <div className="rounded-2xl border border-border bg-card p-3 shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={img3}
                  alt="Team Collaboration"
                  className="w-full h-64 rounded-lg object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="400"
                  height="256"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need to Manage Your Business
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features to streamline your business operations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl"
          >
            <h2 className="mb-4 text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
              What's Included
            </h2>
            <p className="mb-8 text-center text-muted-foreground">
              All the tools you need in one comprehensive package
            </p>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                {planIncludes.map((item, index) => (
                  <div
                    key={index}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & CTA Section - Side by Side */}
      <section id="pricing" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">
              One plan with everything you need. No hidden fees.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Pricing Card */}
            <div
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-success/5 p-8 shadow-sm">
                {/* Popular Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm">
                    <Zap className="h-4 w-4" />
                    Recommended
                  </span>
                </div>

                <div className="mb-8 text-center">
                  <h3 className="mb-2 font-heading text-2xl font-bold text-foreground">
                    Premium Plan
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Everything you need to grow your business
                  </p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-mono text-5xl font-bold text-primary">
                      ₹2000
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate("/auth")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                >
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Start with a free trial • Cancel anytime • No contracts
                </p>
              </div>
            </div>

            {/* CTA Card */}
            <div
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-card p-12 shadow-sm h-full flex flex-col justify-center">
                <h2 className="mb-6 font-heading text-3xl font-bold text-foreground md:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  Join businesses managing their operations efficiently with
                  Tamhan
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                >
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-success">
                  <span className="font-heading text-xl font-bold text-white">
                    T
                  </span>
                </div>
                <span className="font-heading text-xl font-bold text-foreground">
                  Tamhan
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional estimate and invoice generator for modern
                businesses.
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="transition-colors hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    Updates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Tamhan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(LandingPage);
