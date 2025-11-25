import { useState } from "react";
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
import { motion } from "framer-motion";

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
                  E
                </span>
              </div>
              <span className="font-heading text-xl font-bold text-foreground">
                Elegant Pro
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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
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
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Star className="h-4 w-4 fill-primary" />
              Trusted by Businesses Across India
            </div>
            <h1 className="mb-6 font-heading text-4xl font-bold text-foreground md:text-6xl lg:text-7xl">
              Professional Estimates &<br />
              <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Invoices in Minutes
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
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
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 rounded-2xl border border-border bg-card p-4 shadow-2xl"
          >
            <img
              src="https://plus.unsplash.com/premium_photo-1724579095984-c9f71dea7b7d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2069"
              alt="Indian Business Owner"
              className="w-full rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="hidden aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-success/10">
              <div className="text-center">
                <BarChart3 className="mx-auto mb-4 h-20 w-20 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Professional Dashboard
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
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
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
                <img
                  src="https://plus.unsplash.com/premium_photo-1679811674370-7761190a9db0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774"
                  alt="Indian Shop Management"
                  className="w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1582649683921-e1c9e20bce39?w=800&h=600&fit=crop";
                  }}
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
                What's Included
              </h2>
              <p className="mb-8 text-muted-foreground">
                All the tools you need in one comprehensive package
              </p>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  {planIncludes.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                      <span className="text-sm text-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl"
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
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-card p-12 shadow-sm">
                <h2 className="mb-6 font-heading text-3xl font-bold text-foreground md:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  Join businesses managing their operations efficiently with
                  Elegant Pro
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                >
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
                <img
                  src="https://plus.unsplash.com/premium_photo-1679852311419-0c1ce839a4e9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2071"
                  alt="Indian Team Collaboration"
                  className="w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop";
                  }}
                />
              </div>
            </motion.div>
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
                    E
                  </span>
                </div>
                <span className="font-heading text-xl font-bold text-foreground">
                  Elegant Pro
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
            <p>&copy; 2025 Elegant Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
