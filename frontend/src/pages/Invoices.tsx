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
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getBookings } from "@/services/api";
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

interface NormalizedInvoice {
  id: number;
  bookingSlug: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  formattedDate: string;
  dueDate: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  status: "overdue" | "pending";
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
// DATA NORMALIZATION
// ============================================================================

const normalizeInvoice = (booking: BookingData): NormalizedInvoice => {
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

  // Invoice details
  const invoiceNumber =
    bookingInfo?.invoice_details?.invoiceNumber ||
    `INV-${booking.id.toString().slice(-6)}`;
  const invoiceDate =
    bookingInfo?.invoice_details?.date ||
    new Date(booking.created_at).toISOString().split("T")[0];
  const dueDate = bookingInfo?.invoice_details?.dueDate || "";

  const formattedDate = new Date(invoiceDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Status
  const now = new Date();
  const dueDateObj = dueDate ? new Date(dueDate) : null;
  const status = dueDateObj && dueDateObj < now ? "overdue" : "pending";

  return {
    id: booking.id,
    bookingSlug: booking.booking_slug,
    customerName,
    customerPhone,
    customerEmail,
    invoiceNumber,
    invoiceDate,
    formattedDate,
    dueDate,
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
// INVOICE CARD COMPONENT
// ============================================================================

interface InvoiceCardProps {
  invoice: NormalizedInvoice;
}

const InvoiceCard = memo(({ invoice }: InvoiceCardProps) => {
  const navigate = useNavigate();

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(`/invoice-preview?id=${invoice.bookingSlug}`, "_blank");
    },
    [invoice.bookingSlug]
  );

  const handleSendToCustomer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (invoice.customerPhone === "N/A") return;

      const shareableLink = `${window.location.origin}/invoice-preview?id=${invoice.bookingSlug}`;
      const message = `Hello ${invoice.customerName
        }! 👋\n\nThank you for your business with QuoteBhai. 🌿\n\nPlease find your invoice here:\n${shareableLink}\n\n${invoice.dueDate
          ? `Due Date: ${new Date(invoice.dueDate).toLocaleDateString(
            "en-IN"
          )}\n`
          : ""
        }Total Amount: ₹${invoice.totalAmount.toFixed(
          2
        )}\n\nPlease make payment by the due date.\n\nTeam QuoteBhai`;

      const phone = invoice.customerPhone.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, "_blank");
    },
    [invoice]
  );

  const handleCardClick = useCallback(() => {
    navigate(`/invoice-preview?id=${invoice.bookingSlug}`);
  }, [navigate, invoice.bookingSlug]);

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-secondary/10 p-2.5">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {invoice.customerName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${invoice.status === "overdue"
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-warning"
              }`}
          >
            {invoice.status === "overdue" ? "Overdue" : "Pending"}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {invoice.formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {invoice.itemsCount} item{invoice.itemsCount !== 1 ? "s" : ""}
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
            {invoice.customerPhone}
          </span>
        </div>

        {/* Due Date */}
        {invoice.dueDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due Date
            </span>
            <span className="text-sm font-medium text-foreground">
              {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
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
              {invoice.totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <button onClick={handleDownload} className="btn-secondary">
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handleSendToCustomer}
            disabled={invoice.customerPhone === "N/A"}
            className="btn-success"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
});

InvoiceCard.displayName = "InvoiceCard";

// ============================================================================
// STATS COMPONENT
// ============================================================================

interface StatsProps {
  totalInvoiced: number;
  pending: number;
  overdue: number;
}

const InvoiceStats = memo(({ totalInvoiced, pending, overdue }: StatsProps) => (
  <div className="grid gap-4 md:grid-cols-3 mb-6">
    <div className="stat-card stat-success">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Invoiced</p>
          <p className="text-2xl font-bold text-foreground font-mono">
            ₹{totalInvoiced.toLocaleString("en-IN")}
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
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-foreground font-mono">
            ₹{pending.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl bg-warning/10 p-3">
          <Clock className="h-6 w-6 text-warning" />
        </div>
      </div>
    </div>

    <div className="stat-card stat-destructive">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-foreground font-mono">
            ₹{overdue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl bg-destructive/10 p-3">
          <TrendingUp className="h-6 w-6 text-destructive" />
        </div>
      </div>
    </div>
  </div>
));

InvoiceStats.displayName = "InvoiceStats";

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

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);

        if (currentPage > 3) {
          pages.push("...");
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (currentPage < totalPages - 2) {
          pages.push("...");
        }

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
          invoices
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
                    ? "bg-secondary text-secondary-foreground"
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
// MAIN INVOICES COMPONENT
// ============================================================================

const Invoices = () => {
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

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookings(page, 25);

      // Filter invoices only
      const invoiceBookings = response.items.filter((booking: BookingData) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        return bookingInfo?.document_type === "invoice";
      });

      setBookings(invoiceBookings);

      setPaginationInfo({
        currentPage: response.curPage,
        totalPages: response.pageTotal || 1,
        totalItems: response.itemsTotal || invoiceBookings.length,
        itemsPerPage: response.perPage,
        hasNextPage: response.nextPage !== null,
        hasPrevPage: response.prevPage !== null,
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load invoices");
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

  // Normalize invoices
  const normalizedInvoices = useMemo(
    () => bookings.map(normalizeInvoice),
    [bookings]
  );

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    if (!debouncedSearch) return normalizedInvoices;

    const query = debouncedSearch.toLowerCase();
    return normalizedInvoices.filter(
      (invoice) =>
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.customerPhone.toLowerCase().includes(query) ||
        invoice.bookingSlug.toLowerCase().includes(query) ||
        invoice.invoiceNumber.toLowerCase().includes(query)
    );
  }, [normalizedInvoices, debouncedSearch]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalInvoiced = normalizedInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    const pending = normalizedInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    const overdue = normalizedInvoices
      .filter((invoice) => invoice.status === "overdue")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    return {
      totalInvoiced,
      pending,
      overdue,
    };
  }, [normalizedInvoices]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pb-28">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 fade-in-fast">
        {/* Header */}
        <div className="mb-6">
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
                className="btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => navigate("/generate-invoice")}
                className="btn-accent"
              >
                <Plus className="h-4 w-4" />
                New Invoice
              </button>
            </div>
          </div>

          {/* Stats */}
          <InvoiceStats
            totalInvoiced={stats.totalInvoiced}
            pending={stats.pending}
            overdue={stats.overdue}
          />

          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, or invoice number..."
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
            <Loader2 className="h-8 w-8 animate-spin text-secondary mb-4" />
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-state">
            <div className="text-destructive text-4xl mb-2">⚠️</div>
            <h3 className="font-semibold text-foreground mb-2">
              Error Loading Invoices
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button onClick={handleRefresh} className="btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {/* Invoices Grid */}
        {!loading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))
              ) : (
                <div className="col-span-full empty-state">
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
                    onClick={() => navigate("/generate-invoice")}
                    className="btn-secondary"
                  >
                    Create Your First Invoice
                  </button>
                </div>
              )}
            </div>

            {/* Pagination - Only show when not searching */}
            {!searchQuery && filteredInvoices.length > 0 && (
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

export default Invoices;
