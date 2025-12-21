import { memo } from "react";
import { FileText, BookOpen, TrendingUp, FileCheck } from "lucide-react";
import { QuickLinkCard } from "@/components/QuickLinkCard";
import { ActionCard } from "@/components/ActionCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RecentTransactions } from "@/components/estimate/RecentTransactions";

// ============================================================================
// MEMOIZED SECTIONS
// ============================================================================

const QuickActionsSection = memo(() => (
  <section>
    <h2 className="mb-4 font-heading text-lg font-semibold text-foreground text-center">
      Quick Actions
    </h2>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:gap-6 max-w-4xl mx-auto">
      <QuickLinkCard
        icon={TrendingUp}
        label="Sale Report"
        path="/reports"
        gradient="gradient-primary"
      />
      <QuickLinkCard
        icon={BookOpen}
        label="Day Book"
        path="/daybook"
        gradient="gradient-secondary"
      />
    </div>
  </section>
));

QuickActionsSection.displayName = "QuickActionsSection";

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
        path="/generate-estimate"
        variant="primary"
      />
      <ActionCard
        icon={FileCheck}
        title="Generate Invoice"
        description="Create and send invoices instantly"
        path="/generate-invoice"
        variant="secondary"
      />
    </div>
  </section>
));

DocumentActionsSection.displayName = "DocumentActionsSection";

// ============================================================================
// MAIN HOME COMPONENT
// ============================================================================

const Home = memo(() => {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8 fade-in-fast">
        <DashboardHeader />
        <QuickActionsSection />
        <DocumentActionsSection />
        {/* ✅ Reusable Recent Transactions Component */}
        <RecentTransactions limit={5} showTitle={true} />
      </div>
    </div>
  );
});

Home.displayName = "Home";

export default Home;
