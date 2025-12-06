import { memo } from "react";
import {
  Receipt,
  FileText,
  BookOpen,
  TrendingUp,
  Plus,
  FileCheck,
} from "lucide-react";
import { QuickLinkCard } from "@/components/QuickLinkCard";
import { ActionCard } from "@/components/ActionCard";
import { DashboardHeader } from "@/components/DashboardHeader";

// Memoized Quick Actions Section
const QuickActionsSection = memo(() => (
  <section>
    <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
      Quick Actions
    </h2>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
      <QuickLinkCard
        icon={Plus}
        label="Add Transaction"
        path="/transactions/new"
        gradient="gradient-accent"
      />
      <QuickLinkCard
        icon={TrendingUp}
        label="Sale Report"
        path="/reports/sales"
        gradient="gradient-primary"
      />
      <QuickLinkCard
        icon={BookOpen}
        label="Day Book"
        path="/daybook"
        gradient="gradient-secondary"
      />
      <QuickLinkCard
        icon={TrendingUp}
        label="Profit & Loss"
        path="/reports/profit-loss"
        gradient="bg-gradient-to-br from-secondary to-accent"
      />
    </div>
  </section>
));

QuickActionsSection.displayName = "QuickActionsSection";

// Memoized Document Actions Section
const DocumentActionsSection = memo(() => (
  <section>
    <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
      Create Documents
    </h2>
    <div className="grid gap-4 md:grid-cols-2">
      <ActionCard
        icon={FileText}
        title="Generate Estimate"
        description="Create a professional quotation for your customer"
        path="/estimates/new"
        variant="primary"
      />
      <ActionCard
        icon={FileCheck}
        title="Generate Invoice"
        description="Create and send invoices instantly"
        path="/invoices/new"
        variant="secondary"
      />
    </div>
  </section>
));

DocumentActionsSection.displayName = "DocumentActionsSection";

// Memoized Recent Activity Section
const RecentActivitySection = memo(() => (
  <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
  </section>
));

RecentActivitySection.displayName = "RecentActivitySection";

// Main Home Component - Fully Optimized
const Home = memo(() => {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8 fade-in-fast">
        <DashboardHeader />
        <QuickActionsSection />
        <DocumentActionsSection />
        <RecentActivitySection />
      </div>
    </div>
  );
});

Home.displayName = "Home";

export default Home;
