import { useNavigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
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
  Loader2,
  FileSpreadsheet,
  Users,
  FileText,
  Receipt,
} from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getShopInfo,
  getItems,
  getLeads,
  getBookings,
  type Item,
  type Lead,
  type Booking,
} from "@/services/api";
import { logger } from "@/services/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { exportToCSV } from "@/lib/utils";

// Lazy load Razorpay payment component
const RazorpayPayment = lazy(
  () => import("@/components/estimate/RazorpayPayment")
);

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: "Tamhan",
    email: "admin@tamhn.com",
    logo: "",
  });

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
      logger.error("Sign out error", error);
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
    setShowPayment(true);
  };

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        setIsLoading(true);
        const shopInfo = await getShopInfo();

        setCompanyInfo({
          name: shopInfo.shops_settings?.company_name || "Tamhan",
          email: shopInfo.shops_settings?.email || "admin@tamhn.com",
          logo: shopInfo.shops_settings?.logo_url || "",
        });
      } catch (error) {
        logger.error("Failed to load company info", error);
        // Keep fallback values already set in state
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyInfo();
  }, []);

  const handleExport = async (
    type: "items" | "customers" | "estimates" | "invoices"
  ) => {
    try {
      setExportLoading(type);
      let data: any[] = [];
      let filename = "";

      // Helper to fetch all pages
      const fetchAllData = async (
        fetcher: (page: number, perPage: number) => Promise<any>
      ) => {
        let allItems: any[] = [];
        let page = 1;
        const perPage = 100;
        let hasMore = true;

        while (hasMore) {
          const response = await fetcher(page, perPage);
          const items = response.items || [];

          if (items.length > 0) {
            allItems = [...allItems, ...items];
            if (items.length < perPage) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }

          // Safety break to prevent infinite loops
          if (page > 100) hasMore = false;
        }
        return allItems;
      };

      if (type === "items") {
        const allItems = await fetchAllData((page, perPage) => getItems(page, perPage));
        data = allItems.map((item) => ({
          ID: item.id,
          Name: item.title,
          Description: item.description,
          Price: item.price,
          Unit: item.unit,
          SKU: item.sku,
          Currency: item.currency,
          Created: new Date(item.created_at).toLocaleDateString(),
        }));
        filename = "items_export";
      } else if (type === "customers") {
        const allLeads = await fetchAllData((page, perPage) => getLeads(page, perPage));
        data = allLeads.map((lead) => ({
          Name: `${lead.lead_payload.first_name || ""} ${lead.lead_payload.last_name || ""
            }`.trim(),
          Email: lead.lead_payload.email || "",
          Phone: lead.lead_payload.phone_numbers?.[0]?.number || "",
          Address: lead.lead_payload.addresses?.[0]?.line1 || "",
          City: lead.lead_payload.addresses?.[0]?.region || "",
          Created: new Date(lead.created_at).toLocaleDateString(),
        }));
        filename = "customers_export";
      } else if (type === "estimates" || type === "invoices") {
        const allBookings = await fetchAllData((page, perPage) => getBookings(page, perPage));

        // Filter and map bookings
        data = allBookings
          .map((booking) => {
            const firstItem = booking._booking_items_of_bookings?.items?.[0];
            const info = firstItem?.booking_items_info;

            // Check if it matches the requested type
            const docType = info?.document_type || "estimate"; // Default to estimate if unknown
            if ((type === "estimates" && docType !== "estimate") ||
              (type === "invoices" && docType !== "invoice")) {
              return null;
            }

            const customerInfo = info?.customer_info || {};
            const details = type === "estimates" ? info?.estimate_details : info?.invoice_details;
            const number = details?.estimateNumber || details?.invoiceNumber || "N/A";

            // Calculate final price
            // Re-implement calculation logic or extract if stored
            let finalPrice = 0;
            if (info?.tax_info) {
              // Calculate items total
              const items = booking._booking_items_of_bookings?.items || [];
              const subtotal = items.reduce((sum: number, item: any) => {
                const qty = item.quantity || 0;
                const price = parseFloat(item.price?.toString() || "0");
                return sum + (qty * price);
              }, 0);

              const discount = info.tax_info.discount || 0;
              const cgst = info.tax_info.cgst || 0;
              const sgst = info.tax_info.sgst || 0;

              const discountAmount = (subtotal * discount) / 100;
              const taxable = subtotal - discountAmount;
              const taxAmount = (taxable * (cgst + sgst)) / 100;
              finalPrice = taxable + taxAmount;
            }

            return {
              "Name": customerInfo.name || booking._customers?.Full_name || "Unknown",
              [type === "estimates" ? "Estimate Number" : "Invoice Number"]: number,
              "Slug": booking.booking_slug,
              "Address": customerInfo.address || "",
              "Final Price": finalPrice.toFixed(2)
            };
          })
          .filter((item) => item !== null); // Remove mismatched types

        filename = type === "estimates" ? "estimates_export" : "invoices_export";
      }

      if (data.length === 0) {
        toast({
          title: "No data found",
          description: `No ${type} found to export.`,
          variant: "destructive",
        });
        return;
      }

      exportToCSV(data, filename);
      toast({
        title: "Export Successful",
        description: `Your ${type} have been exported to CSV.`,
      });
      setShowExportDialog(false);
    } catch (error) {
      logger.error(`Failed to export ${type}`, error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  interface SettingsItem {
    icon: typeof User;
    label: string;
    description: string;
    toggle?: boolean;
    onClick?: () => void;
  }

  interface SettingsSection {
    title: string;
    items: SettingsItem[];
  }

  const settingsSections: SettingsSection[] = [
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
        {
          icon: User,
          label: "Manage Customers",
          description: "View and manage your customers",
          onClick: () => navigate("/manage-customers"),
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
        },
        {
          icon: FileSpreadsheet,
          label: "Export to Excel",
          description: "Download Items, Customers, Estimates & Invoices",
          onClick: () => setShowExportDialog(true),
        },
      ],
    },
  ];

  // Loading skeleton component
  if (isLoading) {
    return (
      <div className="min-h-screen pb-28">
        <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6 lg:p-8">
          {/* Header Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>

          {/* Profile Card Skeleton */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 animate-pulse">
              <div className="h-16 w-16 rounded-2xl bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Settings Sections Skeleton */}
          {[1, 2, 3].map((section) => (
            <div
              key={section}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="p-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <Separator />
              <div className="divide-y divide-border">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 p-4 animate-pulse"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-success shadow-primary overflow-hidden">
              {companyInfo.logo ? (
                <img
                  src={companyInfo.logo}
                  alt={companyInfo.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="font-heading text-2xl font-bold text-white">T</span>';
                  }}
                />
              ) : (
                <span className="font-heading text-2xl font-bold text-white">
                  T
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                {companyInfo.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {companyInfo.email}
              </p>
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
                      className={`flex w-full items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${!item.toggle ? "cursor-pointer" : ""
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

        {/* Lazy-loaded Razorpay Payment Modal */}
        {showPayment && (
          <Suspense
            fallback={<div className="text-center">Loading payment...</div>}
          >
            <RazorpayPayment
              isOpen={showPayment}
              onClose={() => setShowPayment(false)}
              onSuccess={() => {
                setShowPayment(false);
                toast({
                  title: "Payment Successful!",
                  description: "Your subscription has been activated.",
                });
              }}
              onError={(error) => {
                setShowPayment(false);
                toast({
                  title: "Payment Failed",
                  description: error || "Please try again.",
                  variant: "destructive",
                });
              }}
            />
          </Suspense>
        )}

        {/* Export to Excel Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Data to Excel</DialogTitle>
              <DialogDescription>
                Choose what data you would like to export. Files will be downloaded
                in CSV format.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={() => handleExport("items")}
                disabled={!!exportLoading}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-muted/50 transition-all disabled:opacity-50"
              >
                <div className="rounded-lg bg-pink-100 p-2 text-pink-600">
                  <Package className="h-6 w-6" />
                </div>
                <span className="font-medium">Items</span>
                {exportLoading === "items" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>

              <button
                onClick={() => handleExport("customers")}
                disabled={!!exportLoading}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-muted/50 transition-all disabled:opacity-50"
              >
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <span className="font-medium">Customers</span>
                {exportLoading === "customers" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>

              <button
                onClick={() => handleExport("estimates")}
                disabled={!!exportLoading}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-muted/50 transition-all disabled:opacity-50"
              >
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="font-medium">Estimates</span>
                {exportLoading === "estimates" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>

              <button
                onClick={() => handleExport("invoices")}
                disabled={!!exportLoading}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-muted/50 transition-all disabled:opacity-50"
              >
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <Receipt className="h-6 w-6" />
                </div>
                <span className="font-medium">Invoices</span>
                {exportLoading === "invoices" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>

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
