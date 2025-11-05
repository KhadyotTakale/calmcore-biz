import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Download,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Manage your account details",
        },
        {
          icon: Building2,
          label: "Company Info",
          description: "Business details and branding",
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
          icon: Download,
          label: "Backup",
          description: "Export and backup data",
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
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05,
                      }}
                      className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-muted/50"
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
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscription Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-success/5 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                Premium Subscription
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Unlimited invoices, reports, and multi-user access
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-primary">
                  ₹999
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 font-semibold text-destructive transition-all hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;
