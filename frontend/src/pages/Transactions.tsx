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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getBookings, convertToInvoice } from "@/services/api";
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(`/estimate-preview?id=${booking.bookingSlug}`, "_blank");
    },
    [booking.bookingSlug]
  );

  const handleSendToCustomer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (booking.customerPhone === "N/A") return;

      const shareableLink = `${window.location.origin}/estimate-preview?id=${booking.bookingSlug}`;
      const message = `Hello ${booking.customerName
        }! 👋\n\nThank you for your interest in Tamhan. ✨\n\nPlease find your estimate here:\n${shareableLink}\n\n${booking.validUntil
          ? `Valid Until: ${new Date(booking.validUntil).toLocaleDateString(
            "en-IN"
          )}\n`
          : ""
        }Estimated Amount: ₹${booking.totalAmount.toFixed(
          2
        )}\n\nThis estimate is valid for 30 days from the date of issue.\n\nTeam Tamhan`;

      const phone = booking.customerPhone.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, "_blank");
    },
    [booking]
  );

  const handleCardClick = useCallback(() => {
    navigate(`/estimate-preview?id=${booking.bookingSlug}`);
  }, [navigate, booking.bookingSlug]);

  const handleConvertToInvoice = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!window.confirm("Do you really want to convert this estimate to an invoice?")) {
        return;
      }

      try {
        setIsConverting(true);
        setConversionError(null);
        await convertToInvoice(booking.id);
        navigate(`/invoice-preview?id=${booking.bookingSlug}`);
      } catch (error: any) {
        console.error("Failed to convert to invoice:", error);
        // Show error state on the button/UI instead of alert
        setConversionError(error.message || "Failed to convert");
        setTimeout(() => setConversionError(null), 3000); // Reset after 3 seconds
      } finally {
        setIsConverting(false);
      }
    },
    [navigate, booking.id, booking.bookingSlug]
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
            className={`rounded-full px-2 py-1 text-xs font-medium ${booking.status === "expired"
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
          <button
            onClick={handleConvertToInvoice}
            disabled={isConverting}
            className={conversionError ? "btn-destructive w-full" : "btn-primary"}
          >
            {isConverting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : conversionError ? (
              <span className="text-xs truncate">{conversionError}</span>
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {!isConverting && !conversionError && "Invoice"}
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
// PAGINATION COMPONENT
// ============================================================================

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const Pagination = memo(
  ({ pagination, onPageChange, loading }: PaginationProps) => {
    const {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
    } = pagination;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
          pages.push("...");
        }

        // Show pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (currentPage < totalPages - 2) {
          pages.push("...");
        }

        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-card rounded-lg border border-border">
        {/* Info */}
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {/* <span className="font-medium text-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span>{" "} */}
          estimates
        </div>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage || loading}
            className="p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..." || page === currentPage || loading}
                className={`min-w-[40px] h-10 px-3 rounded-lg font-medium text-sm transition-colors ${page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : page === "..."
                    ? "cursor-default text-muted-foreground"
                    : "border border-border bg-background hover:bg-accent"
                  } disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
            className="p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

// ============================================================================
// MAIN TRANSACTIONS COMPONENT
// ============================================================================

const Transactions = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch bookings
  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookings(page, 25);

      // Filter estimates only
      const estimateBookings = response.items.filter((booking: BookingData) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        const docType = bookingInfo?.document_type;
        return docType === "estimate" || !docType;
      });

      setBookings(estimateBookings);

      // Update pagination info
      setPaginationInfo({
        currentPage: response.curPage,
        totalPages: response.pageTotal || 1,
        totalItems: response.itemsTotal || estimateBookings.length,
        itemsPerPage: response.perPage,
        hasNextPage: response.nextPage !== null,
        hasPrevPage: response.prevPage !== null,
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <>
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

            {/* Pagination - Only show when not searching */}
            {!searchQuery && filteredBookings.length > 0 && (
              <Pagination
                pagination={paginationInfo}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
