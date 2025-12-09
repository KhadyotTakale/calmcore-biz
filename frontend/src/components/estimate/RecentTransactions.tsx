import { memo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, Receipt } from "lucide-react";
import { getBookings } from "@/services/api";
import type { Booking } from "@/services/api";

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

// ============================================================================
// ACTIVITY ITEM COMPONENT (Memoized)
// ============================================================================

interface ActivityItemProps {
  booking: NormalizedBooking;
  onClick: () => void;
}

const ActivityItem = memo(({ booking, onClick }: ActivityItemProps) => {
  const date = new Date(booking.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            booking.docType === "invoice" ? "bg-secondary/10" : "bg-primary/10"
          }`}
        >
          <FileText
            className={`h-5 w-5 ${
              booking.docType === "invoice" ? "text-secondary" : "text-primary"
            }`}
          />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">
            {booking.customerName}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.docType === "invoice" ? "Invoice" : "Estimate"} •{" "}
            {booking.itemsCount} item{booking.itemsCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">
          ₹
          {booking.totalAmount.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
});

ActivityItem.displayName = "ActivityItem";

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
// MAIN RECENT TRANSACTIONS COMPONENT
// ============================================================================

interface RecentTransactionsProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export const RecentTransactions = memo(
  ({
    limit = 5,
    showTitle = true,
    className = "",
  }: RecentTransactionsProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<NormalizedBooking[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load recent transactions
    const loadTransactions = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch first page only (most recent)
        const response = await getBookings(1, 100);

        // Normalize and sort by date (newest first)
        const normalized = response.items
          .map(normalizeBooking)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);

        setTransactions(normalized);
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }, [limit]);

    useEffect(() => {
      loadTransactions();
    }, [loadTransactions]);

    const handleTransactionClick = useCallback(
      (booking: NormalizedBooking) => {
        const route =
          booking.docType === "invoice"
            ? `/invoice-preview?id=${booking.bookingSlug}`
            : `/estimate-preview?id=${booking.bookingSlug}`;
        navigate(route);
      },
      [navigate]
    );

    if (loading) {
      return (
        <div
          className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}
        >
          {showTitle && (
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Recent Transactions
            </h3>
          )}
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}
        >
          {showTitle && (
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Recent Transactions
            </h3>
          )}
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <Receipt className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={loadTransactions} className="btn-sm btn-outline">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}
      >
        {showTitle && (
          <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
            Recent Transactions
          </h3>
        )}
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((booking) => (
              <ActivityItem
                key={booking.id}
                booking={booking}
                onClick={() => handleTransactionClick(booking)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="rounded-full bg-muted p-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No transactions yet. Create your first estimate or invoice!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RecentTransactions.displayName = "RecentTransactions";
