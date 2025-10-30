import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import { getBookings } from "@/services/api";

const TransactionCard = ({ booking, delay = 0 }) => {
  const navigate = useNavigate();
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Determine transaction type based on booking data
  const items = booking._booking_items_of_bookings?.items || [];
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item._items?.price || 0);
  }, 0);

  const typeConfig = {
    sale: {
      icon: ArrowUpRight,
      gradient: "from-success/10 to-success/5",
      iconColor: "text-success",
      iconBg: "bg-success/10",
      label: "Sale",
    },
  };

  const type = "sale";
  const config = typeConfig[type];
  const Icon = config.icon;

  const customer = booking._customers;
  const customerName = customer?.Full_name || "Guest Customer";
  const customerEmail = customer?.email || "";
  const customerPhone = customer?.cust_info?.phone || "";
  const customerAddress = customer?.cust_info?.address || "";

  const bookingDate = new Date(booking.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleClick = () => {
    navigate(`/estimate-preview?id=${booking.booking_slug}`);
  };

  const handleOpenInNewTab = (e) => {
    e.stopPropagation();
    window.open(`/estimate-preview?id=${booking.booking_slug}`, "_blank");
  };

  const toggleCustomerDetails = (e) => {
    e.stopPropagation();
    setShowCustomerDetails(!showCustomerDetails);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
    >
      <div
        onClick={handleClick}
        className={`cursor-pointer bg-gradient-to-br ${config.gradient} p-4 transition-all hover:scale-[1.01]`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl ${config.iconBg} p-2.5`}>
              <Icon
                className={`h-5 w-5 ${config.iconColor}`}
                strokeWidth={2.5}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {customerName}
                </h3>
                <button
                  onClick={handleOpenInNewTab}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{config.label}</span>
                <span>•</span>
                <span className="font-mono">#{booking.booking_slug}</span>
                {items.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p
              className={`font-mono text-lg font-semibold ${config.iconColor}`}
            >
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">{bookingDate}</p>
          </div>
        </div>

        {/* Customer Details Toggle */}
        {customer && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <button
              onClick={toggleCustomerDetails}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              <span>
                {showCustomerDetails ? "Hide" : "View"} customer details
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Customer Details Expandable Section */}
      {showCustomerDetails && customer && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border bg-muted/30 px-4 py-3"
        >
          <div className="space-y-2">
            <div className="grid gap-3 md:grid-cols-2">
              {customerEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground truncate">
                      {customerEmail}
                    </p>
                  </div>
                </div>
              )}

              {customerPhone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{customerPhone}</p>
                  </div>
                </div>
              )}
            </div>

            {customerAddress && (
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">{customerAddress}</p>
                </div>
              </div>
            )}

            {customer.customer_number > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Customer ID:{" "}
                  <span className="font-mono text-foreground">
                    {customer.customer_number}
                  </span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const Transactions = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookings(1, 25);
      setBookings(response.items);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load transactions");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking._customers?.Full_name?.toLowerCase() || "";
    const customerEmail = booking._customers?.email?.toLowerCase() || "";
    const bookingSlug = booking.booking_slug?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return (
      customerName.includes(query) ||
      customerEmail.includes(query) ||
      bookingSlug.includes(query)
    );
  });

  // Calculate statistics
  const totalAmount = bookings.reduce((sum, booking) => {
    const items = booking._booking_items_of_bookings?.items || [];
    return (
      sum +
      items.reduce((itemSum, item) => itemSum + (item._items?.price || 0), 0)
    );
  }, 0);

  const totalTransactions = bookings.length;
  const customersCount = new Set(
    bookings.filter((b) => b._customers?.id).map((b) => b._customers.id)
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Transactions
              </h1>
              <p className="text-sm text-muted-foreground">
                Recent booking transactions with customer details
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalTransactions}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-3">
                  <ArrowUpRight className="h-6 w-6 text-success" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {customersCount}
                  </p>
                </div>
                <div className="rounded-xl bg-warning/10 p-3">
                  <User className="h-6 w-6 text-warning" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, email, or booking ID..."
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center"
          >
            <div className="text-destructive text-4xl mb-2">⚠️</div>
            <h3 className="font-semibold text-foreground mb-2">
              Error Loading Transactions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Transactions List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <TransactionCard
                  key={booking.id}
                  booking={booking}
                  delay={index * 0.05}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-12 text-center"
              >
                <div className="text-muted-foreground text-5xl mb-4">📊</div>
                <h3 className="font-semibold text-foreground mb-2">
                  No Transactions Found
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Start creating bookings to see transactions here"}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
