import { Receipt, FileText, BookOpen, TrendingUp, Plus, FileCheck } from "lucide-react";
import { QuickLinkCard } from "@/components/QuickLinkCard";
import { ActionCard } from "@/components/ActionCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg space-y-6 p-6">
        {/* Header */}
        <DashboardHeader />

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickLinkCard
              icon={Plus}
              label="Add Transaction"
              path="/transactions/new"
              gradient="gradient-accent"
              delay={0.1}
            />
            <QuickLinkCard
              icon={TrendingUp}
              label="Sale Report"
              path="/reports/sales"
              gradient="gradient-primary"
              delay={0.15}
            />
            <QuickLinkCard
              icon={BookOpen}
              label="Day Book"
              path="/reports/daybook"
              gradient="gradient-secondary"
              delay={0.2}
            />
            <QuickLinkCard
              icon={TrendingUp}
              label="Profit & Loss"
              path="/reports/profit-loss"
              gradient="bg-gradient-to-br from-secondary to-accent"
              delay={0.25}
            />
          </div>
        </motion.div>

        {/* Primary Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Create Documents
          </h2>
          <div className="space-y-4">
            <ActionCard
              icon={FileText}
              title="Generate Estimate"
              description="Create a professional quotation for your customer"
              path="/estimates/new"
              variant="primary"
              delay={0.35}
            />
            <ActionCard
              icon={FileCheck}
              title="Generate Invoice"
              description="Create and send invoices instantly"
              path="/invoices/new"
              variant="secondary"
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your recent transactions will appear here
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
