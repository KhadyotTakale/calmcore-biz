import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { getBookings, authManager } from "@/services/api";
import { useUser } from "@clerk/clerk-react";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import { useNavigate } from "react-router-dom";

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

const StatCard = memo(
  ({
    label,
    value,
    loading,
    colorClass,
  }: {
    label: string;
    value: string;
    loading: boolean;
    colorClass: string;
  }) => (
    <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className={`font-mono text-xl font-semibold ${colorClass}`}>
        {loading ? <span className="animate-pulse">...</span> : value}
      </p>
    </div>
  )
);

StatCard.displayName = "StatCard";

const LogoIcon = memo(() => (
  <motion.div
    whileHover={{ rotate: 360 }}
    transition={{ duration: 0.6 }}
    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-success shadow-primary"
  >
    <span className="font-heading text-2xl font-bold text-white">E</span>
  </motion.div>
));

LogoIcon.displayName = "LogoIcon";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
};

const calculateBookingAmount = (booking: any): number => {
  const items = booking._booking_items_of_bookings?.items || [];
  if (items.length === 0) return 0;

  const subtotal = items.reduce((sum: number, item: any) => {
    const quantity = item.quantity || 1;
    const price = parseFloat(item.price) || item._items?.price || 0;
    return sum + quantity * price;
  }, 0);

  const firstItem = items[0];
  const taxInfo = firstItem?.booking_items_info?.tax_info || {};
  const discount = taxInfo.discount || 0;
  const cgst = taxInfo.cgst || 9;
  const sgst = taxInfo.sgst || 9;

  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * cgst) / 100;
  const sgstAmount = (taxableAmount * sgst) / 100;

  return taxableAmount + cgstAmount + sgstAmount;
};

// ============================================================================
// OPTIMIZED FETCH - Uses existing getBookings from api.ts
// ============================================================================

async function fetchAllSalesData(): Promise<{
  todaySales: number;
  monthSales: number;
  totalSales: number;
}> {
  // Fetch all bookings efficiently
  let allBookings: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getBookings(page, 100); // Use larger page size for fewer requests

    if (response.items && response.items.length > 0) {
      allBookings = allBookings.concat(response.items);
    }

    // Check if there are more pages
    hasMore = response.nextPage !== null;
    page++;

    // Safety limit
    if (page > 50) break; // Max 5000 bookings (50 pages × 100)
  }

  // Calculate all metrics in one pass
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  let todaySales = 0;
  let monthSales = 0;
  let totalSales = 0;

  for (const booking of allBookings) {
    const bookingDate = new Date(booking.created_at);
    const bookingAmount = calculateBookingAmount(booking);

    if (bookingDate >= today && bookingDate < tomorrow) {
      todaySales += bookingAmount;
    }

    if (bookingDate >= monthStart) {
      monthSales += bookingAmount;
    }

    totalSales += bookingAmount;
  }

  return { todaySales, monthSales, totalSales };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DashboardHeader = memo(() => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [salesData, setSalesData] = useState({
    today: 0,
    month: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Check auth readiness
  useEffect(() => {
    if (!isLoaded || !user) {
      setIsAuthReady(false);
      return;
    }

    const token = authManager.getCustomerAuthToken();
    const shopId = localStorage.getItem("shopId");

    setIsAuthReady(!!(token && shopId));
  }, [user, isLoaded]);

  // Fetch sales data when auth is ready
  useEffect(() => {
    let isMounted = true;

    const loadSales = async () => {
      if (!isAuthReady) return;

      try {
        setLoading(true);
        const stats = await fetchAllSalesData();

        if (isMounted) {
          setSalesData({
            today: stats.todaySales,
            month: stats.monthSales,
            total: stats.totalSales,
          });
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        if (isMounted) {
          setSalesData({ today: 0, month: 0, total: 0 });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSales();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady]);

  // Memoized callbacks
  const handleSettingsClick = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  // Memoized formatted values
  const formattedValues = useMemo(
    () => ({
      today: formatCurrency(salesData.today),
      month: formatCurrency(salesData.month),
      total: formatCurrency(salesData.total),
    }),
    [salesData]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-info/10 p-8 shadow-lg"
      style={{
        backgroundImage: `url(${dashboardHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-white/80" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <LogoIcon />

            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-2xl font-bold text-foreground"
              >
                Elegant Enterprises
              </motion.h1>
              <p className="text-sm text-muted-foreground">Premium Account</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSettingsClick}
            className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <StatCard
            label="Today's Sales"
            value={formattedValues.today}
            loading={loading}
            colorClass="text-success"
          />
          <StatCard
            label="This Month"
            value={formattedValues.month}
            loading={loading}
            colorClass="text-primary"
          />
          <StatCard
            label="Total Sales"
            value={formattedValues.total}
            loading={loading}
            colorClass="text-info"
          />
        </motion.div>
      </div>
    </motion.div>
  );
});

DashboardHeader.displayName = "DashboardHeader";
