import { Settings, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getBookings } from "@/services/api";
import dashboardHero from "@/assets/dashboard-hero.jpg";

export const DashboardHeader = () => {
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await getBookings(1, 100);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      let todayTotal = 0;
      let monthTotal = 0;
      let allTimeTotal = 0;

      response.items.forEach((booking) => {
        const bookingDate = new Date(booking.created_at);
        const items = booking._booking_items_of_bookings?.items || [];

        const bookingAmount = items.reduce((sum, item) => {
          const quantity = item.quantity || 1;
          const price = parseFloat(item.price) || item._items?.price || 0;
          return sum + quantity * price;
        }, 0);

        // Today's sales
        if (bookingDate >= today && bookingDate < tomorrow) {
          todayTotal += bookingAmount;
        }

        // This month's sales
        if (bookingDate >= monthStart) {
          monthTotal += bookingAmount;
        }

        // All time sales
        allTimeTotal += bookingAmount;
      });

      setTodaySales(todayTotal);
      setMonthSales(monthTotal);
      setTotalSales(allTimeTotal);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

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
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-white/80" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-success shadow-primary"
            >
              <span className="font-heading text-2xl font-bold text-white">
                E
              </span>
            </motion.div>

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

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-muted-foreground">Today's Sales</p>
            <p className="font-mono text-xl font-semibold text-success">
              {loading ? "..." : formatCurrency(todaySales)}
            </p>
          </div>
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-muted-foreground">This Month</p>
            <p className="font-mono text-xl font-semibold text-primary">
              {loading ? "..." : formatCurrency(monthSales)}
            </p>
          </div>
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-muted-foreground">Total Sales</p>
            <p className="font-mono text-xl font-semibold text-info">
              {loading ? "..." : formatCurrency(totalSales)}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
