import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import {
  Loader2,
  RefreshCw,
  Filter,
  Search,
  Download,
  Send,
  Plus,
  TrendingUp,
  User,
  Calendar,
  Package,
  IndianRupee,
  Clock,
} from "lucide-react";
import { getBookings } from "@/services/api";

const InvoiceCard = ({ booking, delay = 0 }) => {
  const navigate = useNavigate();

  // Extract booking data
  const items = booking._booking_items_of_bookings?.items || [];
  const customer = booking._customers;
  const firstItem = items[0];
  const bookingInfo = firstItem?.booking_items_info;

  // Get customer info from booking_items_info or _customers
  const customerName =
    bookingInfo?.customer_info?.name || customer?.Full_name || "Guest Customer";
  const customerPhone =
    bookingInfo?.customer_info?.phone || customer?.cust_info?.phone || "N/A";
  const customerEmail =
    bookingInfo?.customer_info?.email || customer?.email || "";

  // Calculate total amount
  const subtotal = items.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = parseFloat(item.price) || item._items?.price || 0;
    return sum + quantity * price;
  }, 0);

  // Get tax rates from saved data (use defaults if not saved)
  const taxInfo = bookingInfo?.tax_info || {};
  const discount = taxInfo.discount || 0;
  const cgst = taxInfo.cgst || 9;
  const sgst = taxInfo.sgst || 9;

  // Calculate total with tax
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * cgst) / 100;
  const sgstAmount = (taxableAmount * sgst) / 100;
  const totalAmount = taxableAmount + cgstAmount + sgstAmount;

  // Get invoice details
  const invoiceNumber =
    bookingInfo?.invoice_details?.invoiceNumber ||
    `INV-${booking.id.toString().slice(-6)}`;
  const invoiceDate =
    bookingInfo?.invoice_details?.date ||
    new Date(booking.created_at).toISOString().split("T")[0];
  const dueDate = bookingInfo?.invoice_details?.dueDate || "";

  // Format date
  const formattedDate = new Date(invoiceDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(`/invoice-preview?id=${booking.booking_slug}`, "_blank");
  };

  const handleSendToCustomer = (e) => {
    e.stopPropagation();
    const shareableLink = `${window.location.origin}/invoice-preview?id=${booking.booking_slug}`;
    const message = `Hello ${customerName}! 👋\n\nThank you for your business with Mrudgandh. 🌿\n\nPlease find your invoice here:\n${shareableLink}\n\n${
      dueDate
        ? `Due Date: ${new Date(dueDate).toLocaleDateString("en-IN")}\n`
        : ""
    }Total Amount: ₹${totalAmount.toFixed(
      2
    )}\n\nPlease make payment by the due date.\n\nTeam Mrudgandh`;

    const phone = customerPhone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleCardClick = () => {
    navigate(`/invoice-preview?id=${booking.booking_slug}`);
  };

  // Get status badge based on payment/due date
  const getStatusBadge = () => {
    const now = new Date();
    const dueDateObj = dueDate ? new Date(dueDate) : null;

    // You can extend this logic based on actual payment status
    if (dueDateObj && dueDateObj < now) {
      return (
        <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          Overdue
        </span>
      );
    }
    return (
      <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
        Pending
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-secondary/10 p-2.5">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {customerName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {invoiceNumber}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Phone Number */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Phone</span>
          <span className="text-sm font-medium text-foreground">
            {customerPhone}
          </span>
        </div>

        {/* Due Date */}
        {dueDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due Date
            </span>
            <span className="text-sm font-medium text-foreground">
              {new Date(dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Amount */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount
          </span>
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4 text-secondary" />
            <span className="text-xl font-bold text-secondary">
              {totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3">
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
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

const Invoices = () => {
  const navigate = useNavigate();
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

      const response = await getBookings(1, 100); // Fetch more to filter

      // Filter only invoices (document_type = "invoice")
      const invoiceBookings = response.items.filter((booking) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        return bookingInfo?.document_type === "invoice";
      });

      setBookings(invoiceBookings);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load invoices");
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBookings();
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

  // Calculate statistics with tax
  const stats = bookings.reduce(
    (acc, booking) => {
      const items = booking._booking_items_of_bookings?.items || [];
      const firstItem = items[0];
      const bookingInfo = firstItem?.booking_items_info;

      // Calculate subtotal
      const subtotal = items.reduce((itemSum, item) => {
        const quantity = item.quantity || 1;
        const price = parseFloat(item.price) || item._items?.price || 0;
        return itemSum + quantity * price;
      }, 0);

      // Get tax rates
      const taxInfo = bookingInfo?.tax_info || {};
      const discount = taxInfo.discount || 0;
      const cgst = taxInfo.cgst || 9;
      const sgst = taxInfo.sgst || 9;

      // Calculate with tax
      const discountAmount = (subtotal * discount) / 100;
      const taxableAmount = subtotal - discountAmount;
      const cgstAmount = (taxableAmount * cgst) / 100;
      const sgstAmount = (taxableAmount * sgst) / 100;
      const bookingTotal = taxableAmount + cgstAmount + sgstAmount;

      // Check if overdue
      const dueDate = bookingInfo?.invoice_details?.dueDate;
      const isOverdue = dueDate && new Date(dueDate) < new Date();

      return {
        total: acc.total + bookingTotal,
        pending: acc.pending + bookingTotal,
        overdue: acc.overdue + (isOverdue ? bookingTotal : 0),
      };
    },
    { total: 0, pending: 0, overdue: 0 }
  );

  const totalInvoices = bookings.length;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pb-28">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Invoices
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your invoices
              </p>
            </div>
            <div className="flex gap-2">
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
              <button
                onClick={() => navigate("/generate-invoice")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-destructive px-4 py-2 text-sm font-medium text-white shadow-accent hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                New Invoice
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Invoiced
                  </p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ₹{stats.total.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-3">
                  <IndianRupee className="h-6 w-6 text-success" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ₹{stats.pending.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-warning/10 p-3">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ₹{stats.overdue.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-3">
                  <TrendingUp className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, or booking ID..."
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary mb-4" />
            <p className="text-muted-foreground">Loading invoices...</p>
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
              Error Loading Invoices
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Invoices Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <InvoiceCard
                  key={booking.id}
                  booking={booking}
                  delay={index * 0.05}
                />
              ))
            ) : (
              <div className="col-span-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-12 text-center"
                >
                  <div className="text-muted-foreground text-5xl mb-4">📄</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No Invoices Found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Start creating invoices to see them here"}
                  </p>
                  <button
                    onClick={() => navigate("/invoices/new")}
                    className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90"
                  >
                    Create Your First Invoice
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
