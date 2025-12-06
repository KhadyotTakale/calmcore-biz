import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { getBookings } from "@/services/api";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { useDebounce } from "@/hooks/useDebounce";

// ============================================================================
// TYPES
// ============================================================================

interface BookingData {
  id: number;
  booking_slug: string;
  created_at: number;
  _booking_items_of_bookings?: {
    items: any[];
  };
  _customers?: any;
}

interface NormalizedBooking {
  id: number;
  bookingSlug: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  estimateNumber: string;
  estimateDate: string;
  formattedDate: string;
  validUntil: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  status: "active" | "expired";
  items: any[];
}

// ============================================================================
// DATA NORMALIZATION (Extract once, use everywhere)
// ============================================================================

const normalizeBooking = (booking: BookingData): NormalizedBooking => {
  const items = booking._booking_items_of_bookings?.items || [];
  const firstItem = items[0];
  const bookingInfo = firstItem?.booking_items_info;
  const customer = booking._customers;

  // Extract customer info
  const customerName =
    bookingInfo?.customer_info?.name || customer?.Full_name || "Guest Customer";
  const customerPhone =
    bookingInfo?.customer_info?.phone || customer?.cust_info?.phone || "N/A";
  const customerEmail =
    bookingInfo?.customer_info?.email || customer?.email || "";

  // Calculate amounts
  const subtotal = items.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = parseFloat(item.price) || item._items?.price || 0;
    return sum + quantity * price;
  }, 0);

  // Tax info
  const taxInfo = bookingInfo?.tax_info || {};
  const discount = taxInfo.discount || 0;
  const cgst = taxInfo.cgst || 9;
  const sgst = taxInfo.sgst || 9;

  // Calculate total
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * cgst) / 100;
  const sgstAmount = (taxableAmount * sgst) / 100;
  const totalAmount = taxableAmount + cgstAmount + sgstAmount;

  // Estimate details
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

  // Status
  const now = new Date();
  const validDate = validUntil ? new Date(validUntil) : null;
  const status = validDate && validDate < now ? "expired" : "active";

  return {
    id: booking.id,
    bookingSlug: booking.booking_slug,
    customerName,
    customerPhone,
    customerEmail,
    estimateNumber,
    estimateDate,
    formattedDate,
    validUntil,
    itemsCount: items.length,
    subtotal,
    discount,
    cgst,
    sgst,
    totalAmount,
    status,
    items,
  };
};

// ============================================================================
// TRANSACTION CARD COMPONENT (Memoized)
// ============================================================================

interface TransactionCardProps {
  booking: NormalizedBooking;
}

const TransactionCard = memo(({ booking }: TransactionCardProps) => {
  const navigate = useNavigate();
  const { generateAndDownloadPDF, isGenerating } = usePDFGenerator();

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(`/estimate-preview?id=${booking.bookingSlug}`, "_blank");
    },
    [booking.bookingSlug]
  );

  const handleSendToCustomer = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (booking.customerPhone === "N/A") return;

      await generateAndDownloadPDF({
        bookingSlug: booking.bookingSlug,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        estimateNumber: booking.estimateNumber,
        totalAmount: booking.totalAmount,
        validUntil: booking.validUntil,
      });
    },
    [booking, generateAndDownloadPDF]
  );

  const handleCardClick = useCallback(() => {
    navigate(`/estimate-preview?id=${booking.bookingSlug}`);
  }, [navigate, booking.bookingSlug]);

  const handleConvertToInvoice = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/invoice-preview?id=${booking.bookingSlug}`);
    },
    [navigate, booking.bookingSlug]
  );

  return (
    <div
      onClick={handleCardClick}
      className="transaction-card group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {booking.customerName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {booking.estimateNumber}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              booking.status === "expired"
                ? "bg-destructive/10 text-destructive"
                : "bg-success/10 text-success"
            }`}
          >
            {booking.status === "expired" ? "Expired" : "Active"}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {booking.formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {booking.itemsCount} item{booking.itemsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Phone */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Phone</span>
          <span className="text-sm font-medium text-foreground">
            {booking.customerPhone}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount
          </span>
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold text-primary">
              {booking.totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <button onClick={handleDownload} className="btn-secondary">
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handleSendToCustomer}
            disabled={booking.customerPhone === "N/A" || isGenerating}
            className="btn-success"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isGenerating ? "Sending..." : "Send"}
          </button>
          <button onClick={handleConvertToInvoice} className="btn-primary">
            <FileText className="h-4 w-4" />
            Invoice
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
});

TransactionCard.displayName = "TransactionCard";

// ============================================================================
// STATS COMPONENT (Memoized)
// ============================================================================

interface StatsProps {
  totalTransactions: number;
  totalAmount: number;
  customersCount: number;
}

const TransactionStats = memo(
  ({ totalTransactions, totalAmount, customersCount }: StatsProps) => (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <div className="stat-card stat-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Estimates</p>
            <p className="text-2xl font-bold text-foreground">
              {totalTransactions}
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="stat-card stat-success">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-foreground font-mono">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-success/10 p-3">
            <IndianRupee className="h-6 w-6 text-success" />
          </div>
        </div>
      </div>

      <div className="stat-card stat-warning">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
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
  )
);

TransactionStats.displayName = "TransactionStats";

// ============================================================================
// MAIN TRANSACTIONS COMPONENT
// ============================================================================

const Transactions = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookings(1, 100);

      // Filter estimates only
      const estimateBookings = response.items.filter((booking: BookingData) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        const docType = bookingInfo?.document_type;
        return docType === "estimate" || !docType;
      });

      setBookings(estimateBookings);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchBookings();
  }, []);

  // Normalize bookings (memoized)
  const normalizedBookings = useMemo(
    () => bookings.map(normalizeBooking),
    [bookings]
  );

  // Filter bookings (memoized with debounced search)
  const filteredBookings = useMemo(() => {
    if (!debouncedSearch) return normalizedBookings;

    const query = debouncedSearch.toLowerCase();
    return normalizedBookings.filter(
      (booking) =>
        booking.customerName.toLowerCase().includes(query) ||
        booking.customerPhone.toLowerCase().includes(query) ||
        booking.bookingSlug.toLowerCase().includes(query) ||
        booking.estimateNumber.toLowerCase().includes(query)
    );
  }, [normalizedBookings, debouncedSearch]);

  // Calculate statistics (memoized)
  const stats = useMemo(() => {
    const totalAmount = normalizedBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const customersCount = new Set(
      normalizedBookings
        .filter((b) => b.customerName !== "Guest Customer")
        .map((b) => b.customerName)
    ).size;

    return {
      totalTransactions: normalizedBookings.length,
      totalAmount,
      customersCount,
    };
  }, [normalizedBookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 fade-in-fast">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Estimates
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your estimates
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
              <button
                onClick={() => navigate("/generate-estimate")}
                className="btn-accent"
              >
                <Plus className="h-4 w-4" />
                New Estimate
              </button>
            </div>
          </div>

          {/* Stats */}
          <TransactionStats
            totalTransactions={stats.totalTransactions}
            totalAmount={stats.totalAmount}
            customersCount={stats.customersCount}
          />

          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, or booking ID..."
                className="search-input"
              />
            </div>
            <button className="btn-secondary">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading estimates...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-state">
            <div className="text-destructive text-4xl mb-2">⚠️</div>
            <h3 className="font-semibold text-foreground mb-2">
              Error Loading Estimates
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button onClick={handleRefresh} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Transactions Grid */}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TransactionCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="col-span-full empty-state">
                <div className="text-muted-foreground text-5xl mb-4">📊</div>
                <h3 className="font-semibold text-foreground mb-2">
                  No Estimates Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Start creating estimates to see them here"}
                </p>
                <button
                  onClick={() => navigate("/generate-estimate")}
                  className="btn-primary"
                >
                  Create Your First Estimate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
