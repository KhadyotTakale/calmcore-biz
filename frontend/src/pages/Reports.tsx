import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  FileText,
  Users,
  Package,
  Loader2,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getBookings } from "@/services/api";
import type { Booking } from "@/services/api";
import { RecentTransactions } from "@/components/estimate/RecentTransactions";

// ============================================================================
// TYPES
// ============================================================================

interface NormalizedBooking {
  id: number;
  bookingSlug: string;
  customerName: string;
  docType: "estimate" | "invoice";
  createdAt: number;
  totalAmount: number;
  itemsCount: number;
}

interface Stats {
  totalEstimates: number;
  totalInvoices: number;
  totalCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
  weeklyData: number[];
  monthlyGrowth: number;
}

// ============================================================================
// STAT CARD COMPONENT (Memoized)
// ============================================================================

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  gradient: string;
}

const StatCard = memo(
  ({
    icon: Icon,
    label,
    value,
    change,
    changeType,
    gradient,
  }: StatCardProps) => (
    <div className={`stat-card ${gradient} relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {changeType === "positive" && (
              <ArrowUpRight className="h-3 w-3 text-success" />
            )}
            {changeType === "negative" && (
              <ArrowDownRight className="h-3 w-3 text-destructive" />
            )}
            <span
              className={`text-xs ${
                changeType === "positive"
                  ? "text-success"
                  : changeType === "negative"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
);

StatCard.displayName = "StatCard";

// ============================================================================
// QUICK ACTION CARD (Memoized)
// ============================================================================

interface QuickActionProps {
  title: string;
  description: string;
  gradient: string;
  onClick: () => void;
}

const QuickActionCard = memo(
  ({ title, description, gradient, onClick }: QuickActionProps) => (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-border bg-gradient-to-br ${gradient} p-6 text-left shadow-sm transition-all hover:shadow-md hover:scale-[1.02]`}
    >
      <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )
);

QuickActionCard.displayName = "QuickActionCard";

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

const normalizeBooking = (booking: Booking): NormalizedBooking => {
  const items = booking._booking_items_of_bookings?.items || [];
  const firstItem = items[0];
  const bookingInfo = firstItem?.booking_items_info;
  const customer = booking._customers;

  const customerName =
    bookingInfo?.customer_info?.name || customer?.Full_name || "Guest";
  const docType =
    bookingInfo?.document_type === "invoice" ? "invoice" : "estimate";

  // Calculate total
  const subtotal = items.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = parseFloat(item.price) || item._items?.price || 0;
    return sum + quantity * price;
  }, 0);

  const taxInfo = bookingInfo?.tax_info || {};
  const discount = taxInfo.discount || 0;
  const cgst = taxInfo.cgst || 9;
  const sgst = taxInfo.sgst || 9;

  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * cgst) / 100;
  const sgstAmount = (taxableAmount * sgst) / 100;
  const totalAmount = taxableAmount + cgstAmount + sgstAmount;

  return {
    id: booking.id,
    bookingSlug: booking.booking_slug,
    customerName,
    docType,
    createdAt: booking.created_at,
    totalAmount,
    itemsCount: items.length,
  };
};

// ============================================================================
// MAIN REPORTS COMPONENT
// ============================================================================

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<NormalizedBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load all bookings efficiently
  const loadReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let allBookings: Booking[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages
      while (hasMorePages) {
        const response = await getBookings(currentPage, 100);
        allBookings = allBookings.concat(response.items);
        hasMorePages = response.nextPage !== null;
        currentPage++;
      }

      // Normalize all bookings
      const normalized = allBookings.map(normalizeBooking);
      setBookings(normalized);
    } catch (err: any) {
      setError(err.message || "Failed to load reports data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  // Calculate statistics (memoized)
  const stats = useMemo((): Stats => {
    const estimates = bookings.filter((b) => b.docType === "estimate");
    const invoices = bookings.filter((b) => b.docType === "invoice");

    const uniqueCustomers = new Set(
      bookings
        .filter((b) => b.customerName !== "Guest")
        .map((b) => b.customerName)
    ).size;

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const avgOrderValue =
      bookings.length > 0 ? totalRevenue / bookings.length : 0;

    // Weekly data (last 7 days)
    const now = Date.now();
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    bookings.forEach((booking) => {
      const daysDiff = Math.floor(
        (now - booking.createdAt) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff >= 0 && daysDiff < 7) {
        weeklyData[6 - daysDiff]++;
      }
    });

    // Monthly growth calculation
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

    const lastMonthBookings = bookings.filter(
      (b) => b.createdAt >= thirtyDaysAgo
    ).length;
    const previousMonthBookings = bookings.filter(
      (b) => b.createdAt >= sixtyDaysAgo && b.createdAt < thirtyDaysAgo
    ).length;

    const monthlyGrowth =
      previousMonthBookings > 0
        ? ((lastMonthBookings - previousMonthBookings) /
            previousMonthBookings) *
          100
        : 0;

    return {
      totalEstimates: estimates.length,
      totalInvoices: invoices.length,
      totalCustomers: uniqueCustomers,
      totalRevenue,
      avgOrderValue,
      weeklyData,
      monthlyGrowth,
    };
  }, [bookings]);

  const handleRefresh = useCallback(() => {
    loadReportsData();
    setRefreshKey((prev) => prev + 1); // Force RecentTransactions to refresh
  }, [loadReportsData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h3 className="font-semibold text-foreground mb-2">
            Error Loading Reports
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button onClick={loadReportsData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 fade-in-fast">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Reports & Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your business performance
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button className="btn-outline">
                <Calendar className="h-4 w-4" />
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            icon={FileText}
            label="Total Estimates"
            value={stats.totalEstimates.toString()}
            change={
              stats.totalEstimates > 0
                ? `${stats.totalEstimates} created`
                : "No estimates yet"
            }
            changeType={stats.totalEstimates > 0 ? "positive" : "neutral"}
            gradient="stat-primary"
          />
          <StatCard
            icon={Package}
            label="Total Invoices"
            value={stats.totalInvoices.toString()}
            change={
              stats.totalInvoices > 0
                ? `${stats.totalInvoices} created`
                : "No invoices yet"
            }
            changeType={stats.totalInvoices > 0 ? "positive" : "neutral"}
            gradient="stat-secondary"
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={stats.totalCustomers.toString()}
            change={
              stats.monthlyGrowth !== 0
                ? `${
                    stats.monthlyGrowth > 0 ? "+" : ""
                  }${stats.monthlyGrowth.toFixed(1)}% this month`
                : "No growth data"
            }
            changeType={
              stats.monthlyGrowth > 0
                ? "positive"
                : stats.monthlyGrowth < 0
                ? "negative"
                : "neutral"
            }
            gradient="stat-accent"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
            change={
              stats.avgOrderValue > 0
                ? `Avg: ₹${stats.avgOrderValue.toFixed(0)}`
                : "No revenue yet"
            }
            changeType={stats.totalRevenue > 0 ? "positive" : "neutral"}
            gradient="stat-success"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Weekly Activity Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Activity This Week
            </h3>
            <div className="flex h-64 items-end justify-around gap-2">
              {stats.weeklyData.map((count, index) => {
                const maxCount = Math.max(...stats.weeklyData, 1);
                const height = (count / maxCount) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center justify-end"
                  >
                    <div className="mb-2 text-xs font-medium text-foreground">
                      {count}
                    </div>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary to-success transition-all duration-500"
                      style={{ height: height > 5 ? `${height}%` : "5%" }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-around text-xs text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => (
                  <span key={i}>{day}</span>
                )
              )}
            </div>
          </div>

          {/* ✅ Reusable Recent Transactions Component */}
          <RecentTransactions key={refreshKey} limit={5} showTitle={true} />
        </div>

        {/* Quick Reports */}
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="All Estimates"
              description={`${stats.totalEstimates} estimates created`}
              gradient="from-primary/10 to-primary/5"
              onClick={() => navigate("/estimates")}
            />
            <QuickActionCard
              title="All Invoices"
              description={`${stats.totalInvoices} invoices created`}
              gradient="from-success/10 to-success/5"
              onClick={() => navigate("/invoices")}
            />
            <QuickActionCard
              title="Customer List"
              description={`${stats.totalCustomers} total customers`}
              gradient="from-secondary/10 to-secondary/5"
              onClick={() => navigate("/customers")}
            />
            <QuickActionCard
              title="Day Book"
              description="View daily transactions"
              gradient="from-warning/10 to-warning/5"
              onClick={() => navigate("/daybook")}
            />
            <QuickActionCard
              title="Generate Estimate"
              description="Create new estimate"
              gradient="from-info/10 to-info/5"
              onClick={() => navigate("/generate-estimate")}
            />
            <QuickActionCard
              title="Generate Invoice"
              description="Create new invoice"
              gradient="from-accent/10 to-accent/5"
              onClick={() => navigate("/generate-invoice")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
