import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  RefreshCw,
  Search,
  Download,
  Send,
  TrendingUp,
  User,
  Calendar,
  Package,
  IndianRupee,
  CalendarCheck,
  FileText,
} from "lucide-react";
import { getBookings } from "@/services/api";

const TransactionCard = ({ booking, delay = 0 }) => {
  const navigate = useNavigate();

  const items = booking._booking_items_of_bookings?.items || [];
  const customer = booking._customers;
  const firstItem = items[0];
  const bookingInfo = firstItem?.booking_items_info;

  const customerName =
    bookingInfo?.customer_info?.name || customer?.Full_name || "Guest Customer";
  const customerPhone =
    bookingInfo?.customer_info?.phone || customer?.cust_info?.phone || "N/A";

  const totalAmount = items.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = parseFloat(item.price) || item._items?.price || 0;
    return sum + quantity * price;
  }, 0);

  const estimateNumber =
    bookingInfo?.estimate_details?.estimateNumber ||
    `EST-${booking.id.toString().slice(-6)}`;
  const estimateDate =
    bookingInfo?.estimate_details?.date ||
    new Date(booking.created_at).toISOString().split("T")[0];
  const validUntil = bookingInfo?.estimate_details?.validUntil || "";

  const formattedDate = new Date(estimateDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = new Date(booking.created_at).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(`/estimate-preview?id=${booking.booking_slug}`, "_blank");
  };

  const handleSendToCustomer = (e) => {
    e.stopPropagation();
    const shareableLink = `${window.location.origin}/estimate-preview?id=${booking.booking_slug}`;
    const message = `Hello ${customerName}! 👋\n\nThank you for your interest in Mrudgandh services. 🌿\n\nPlease find your estimate here:\n${shareableLink}\n\n${
      validUntil
        ? `Valid until: ${new Date(validUntil).toLocaleDateString("en-IN")}\n`
        : ""
    }Total Amount: ₹${totalAmount.toFixed(
      2
    )}\n\nFeel free to reach out for any questions!\n\nTeam Mrudgandh`;

    const phone = customerPhone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleCardClick = () => {
    navigate(`/estimate-preview?id=${booking.booking_slug}`);
  };

  const handleConvertToInvoice = (e) => {
    e.stopPropagation();
    navigate(`/invoice-preview?id=${booking.booking_slug}`);
  };
  const getStatusBadge = () => {
    const now = new Date();
    const validDate = validUntil ? new Date(validUntil) : null;

    if (validDate && validDate < now) {
      return (
        <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          Expired
        </span>
      );
    }
    return (
      <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
        Active
      </span>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        opacity: 0,
        animation: `fadeInUp 0.3s ease-out ${delay}s forwards`,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    >
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {customerName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {estimateNumber}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Phone</span>
          <span className="text-sm font-medium text-foreground">
            {customerPhone}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount
          </span>
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold text-primary">
              {totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handleSendToCustomer}
            disabled={customerPhone === "N/A"}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
          <button
            onClick={handleConvertToInvoice}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            Invoice
          </button>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const Daybook = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTodayBookings();
  }, []);

  const fetchTodayBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookings(1, 100);

      // Filter bookings for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBookings = response.items.filter((booking) => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= today && bookingDate < tomorrow;
      });

      setBookings(todayBookings);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching today's bookings:", err);
      setError(err.message || "Failed to load today's estimates");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTodayBookings();
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const items = booking._booking_items_of_bookings?.items || [];
    const firstItem = items[0];
    const bookingInfo = firstItem?.booking_items_info;
    const customer = booking._customers;

    const customerName = (
      bookingInfo?.customer_info?.name ||
      customer?.Full_name ||
      ""
    ).toLowerCase();
    const customerPhone = (
      bookingInfo?.customer_info?.phone ||
      customer?.cust_info?.phone ||
      ""
    ).toLowerCase();
    const bookingSlug = (booking.booking_slug || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      customerName.includes(query) ||
      customerPhone.includes(query) ||
      bookingSlug.includes(query)
    );
  });

  // Calculate statistics for today
  const totalAmount = bookings.reduce((sum, booking) => {
    const items = booking._booking_items_of_bookings?.items || [];
    return (
      sum +
      items.reduce((itemSum, item) => {
        const quantity = item.quantity || 1;
        const price = parseFloat(item.price) || item._items?.price || 0;
        return itemSum + quantity * price;
      }, 0)
    );
  }, 0);

  const totalTransactions = bookings.length;
  const customersCount = new Set(
    bookings
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

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                    Today's Daybook
                  </h1>
                  <p className="text-sm text-muted-foreground">{todayDate}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today's Estimates
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalTransactions}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today's Revenue
                  </p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-3">
                  <IndianRupee className="h-6 w-6 text-success" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today's Customers
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {customersCount}
                  </p>
                </div>
                <div className="rounded-xl bg-warning/10 p-3">
                  <User className="h-6 w-6 text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search today's estimates by customer name, phone, or booking ID..."
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Loading today's estimates...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <div className="text-destructive text-4xl mb-2">⚠️</div>
            <h3 className="font-semibold text-foreground mb-2">
              Error Loading Estimates
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Transactions Grid */}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <TransactionCard
                  key={booking.id}
                  booking={booking}
                  delay={index * 0.05}
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <div className="text-muted-foreground text-5xl mb-4">📅</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No Estimates Today
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? "No estimates match your search"
                      : "No estimates have been created today yet"}
                  </p>
                  <button
                    onClick={() => navigate("/generate-estimate")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Create First Estimate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Daybook;
