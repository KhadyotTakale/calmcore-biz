import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Calendar,
  FileText,
  Users,
  Package,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookings } from "@/services/api"; // Fixed import path
import type { Booking } from "@/services/api";

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalEstimates: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    weeklyData: [] as number[],
  });

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);

      // Fetch all bookings (same as Transactions page)
      const response = await getBookings(1, 100);
      const allBookings = response.items;

      setBookings(allBookings);

      // Separate estimates and invoices
      const estimates = allBookings.filter((booking) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        const docType = bookingInfo?.document_type;
        return docType === "estimate" || !docType; // Include legacy estimates
      });

      const invoices = allBookings.filter((booking) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        return bookingInfo?.document_type === "invoice";
      });

      // Calculate unique customers
      const uniqueCustomers = new Set(
        allBookings
          .filter((b) => {
            const items = b._booking_items_of_bookings?.items || [];
            const bookingInfo = items[0]?.booking_items_info;
            return bookingInfo?.customer_info?.name || b._customers?.id;
          })
          .map((b) => {
            const items = b._booking_items_of_bookings?.items || [];
            const bookingInfo = items[0]?.booking_items_info;
            return bookingInfo?.customer_info?.name || b._customers?.id;
          })
      ).size;

      // Calculate total revenue with tax (same logic as Transactions page)
      let totalRevenue = 0;
      allBookings.forEach((booking) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
          const quantity = item.quantity || 1;
          const price = parseFloat(item.price) || item._items?.price || 0;
          return sum + quantity * price;
        }, 0);

        // Get tax rates from saved data
        const taxInfo = bookingInfo?.tax_info || {};
        const discount = taxInfo.discount || 0;
        const cgst = taxInfo.cgst || 9;
        const sgst = taxInfo.sgst || 9;

        // Calculate total with tax
        const discountAmount = (subtotal * discount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const cgstAmount = (taxableAmount * cgst) / 100;
        const sgstAmount = (taxableAmount * sgst) / 100;
        const bookingTotal = taxableAmount + cgstAmount + sgstAmount;

        totalRevenue += bookingTotal;
      });

      // Get last 7 days data
      const now = Date.now();
      const weeklyData = [0, 0, 0, 0, 0, 0, 0];
      allBookings.forEach((booking) => {
        const daysDiff = Math.floor(
          (now - booking.created_at) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff >= 0 && daysDiff < 7) {
          weeklyData[6 - daysDiff]++;
        }
      });

      setStats({
        totalEstimates: estimates.length,
        totalInvoices: invoices.length,
        totalCustomers: uniqueCustomers,
        totalRevenue: totalRevenue,
        weeklyData,
      });
    } catch (error) {
      console.error("Failed to load reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
              Reports & Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your business performance
            </p>
          </div>
          <Button variant="outline" className="rounded-xl">
            <Calendar className="mr-2 h-4 w-4" />
            All Time
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={FileText}
            label="Total Estimates"
            value={stats.totalEstimates.toString()}
            change={
              stats.totalEstimates > 0
                ? `${stats.totalEstimates} created`
                : "No estimates yet"
            }
            changeType="positive"
            gradient="gradient-primary"
            delay={0.1}
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
            changeType="positive"
            gradient="gradient-secondary"
            delay={0.15}
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={stats.totalCustomers.toString()}
            change={
              stats.totalCustomers > 0
                ? `${stats.totalCustomers} unique`
                : "No customers yet"
            }
            changeType="positive"
            gradient="gradient-accent"
            delay={0.2}
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
            change={
              stats.totalRevenue > 0 ? "From all bookings" : "No revenue yet"
            }
            changeType="positive"
            gradient="bg-gradient-to-br from-success to-success/80"
            delay={0.25}
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 lg:grid-cols-2"
        >
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
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    className="flex flex-1 flex-col items-center justify-end"
                  >
                    <div className="mb-2 text-xs font-medium text-foreground">
                      {count}
                    </div>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary to-success"
                      style={{ height: height > 5 ? `${height}%` : "5%" }}
                    />
                  </motion.div>
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

          {/* Recent Activity */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking, index) => {
                const items = booking._booking_items_of_bookings?.items || [];
                const firstItem = items[0];
                const bookingInfo = firstItem?.booking_items_info;
                const customer = booking._customers;

                const customerName =
                  bookingInfo?.customer_info?.name ||
                  customer?.Full_name ||
                  "Guest";
                const docType = bookingInfo?.document_type || "estimate";
                const date = new Date(booking.created_at).toLocaleDateString(
                  "en-IN",
                  {
                    month: "short",
                    day: "numeric",
                  }
                );

                // Calculate total
                const subtotal = items.reduce((sum, item) => {
                  const quantity = item.quantity || 1;
                  const price =
                    parseFloat(item.price) || item._items?.price || 0;
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

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(
                        docType === "invoice"
                          ? `/invoice-preview?id=${booking.booking_slug}`
                          : `/estimate-preview?id=${booking.booking_slug}`
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          docType === "invoice"
                            ? "bg-secondary/10"
                            : "bg-primary/10"
                        }`}
                      >
                        <FileText
                          className={`h-5 w-5 ${
                            docType === "invoice"
                              ? "text-secondary"
                              : "text-primary"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {docType === "invoice" ? "Invoice" : "Estimate"} •{" "}
                          {items.length} item{items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        ₹{totalAmount.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </motion.div>
                );
              })}
              {bookings.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No activity yet
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Reports */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Quick Reports
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "All Estimates",
                description: `${stats.totalEstimates} estimates created`,
                gradient: "from-primary/10 to-primary/5",
                onclick: () => navigate("/estimates"),
              },
              {
                title: "All Invoices",
                description: `${stats.totalInvoices} invoices created`,
                gradient: "from-success/10 to-success/5",
                onclick: () => navigate("/invoices"),
              },
              {
                title: "Customer List",
                description: `${stats.totalCustomers} total customers`,
                gradient: "from-secondary/10 to-secondary/5",
                onclick: () => navigate("/customers"),
              },
              {
                title: "Day Book",
                description: "View daily transactions",
                gradient: "from-warning/10 to-warning/5",
                onclick: () => navigate("/daybook"),
              },
              {
                title: "Generate Estimate",
                description: "Create new estimate",
                gradient: "from-info/10 to-info/5",
                onclick: () => navigate("/generate-estimate"),
              },
              {
                title: "Generate Invoice",
                description: "Create new invoice",
                gradient: "from-accent/10 to-accent/5",
                onclick: () => navigate("/generate-invoice"),
              },
            ].map((report, index) => (
              <motion.button
                key={report.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={report.onclick}
                className={`rounded-2xl border border-border bg-gradient-to-br ${report.gradient} p-6 text-left shadow-sm transition-all hover:shadow-md`}
              >
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
