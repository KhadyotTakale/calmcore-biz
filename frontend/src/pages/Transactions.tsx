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
} from "lucide-react";
import { getBookings } from "@/services/api";
import html2pdf from "html2pdf.js";

const TransactionCard = ({ booking, delay = 0 }) => {
  const navigate = useNavigate();

  // Extract booking data
  const items = booking._booking_items_of_bookings?.items || [];
  const customer = booking._customers;
  const firstItem = items[0];
  const bookingInfo = firstItem?.booking_items_info;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Get estimate details
  const estimateNumber =
    bookingInfo?.estimate_details?.estimateNumber ||
    `EST-${booking.id.toString().slice(-6)}`;
  const estimateDate =
    bookingInfo?.estimate_details?.date ||
    new Date(booking.created_at).toISOString().split("T")[0];
  const validUntil = bookingInfo?.estimate_details?.validUntil || "";

  // Format date
  const formattedDate = new Date(estimateDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(`/estimate-preview?id=${booking.booking_slug}`, "_blank");
  };

  const handleSendToCustomer = async (e) => {
    e.stopPropagation();

    try {
      setIsGeneratingPDF(true);

      const phone = customerPhone.replace(/\D/g, "");
      const estimateUrl = `${window.location.origin}/estimate-preview?id=${booking.booking_slug}`;

      // Step 1: Generate and download PDF
      // Create a hidden iframe to load the estimate
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Wait for iframe to load
      await new Promise((resolve, reject) => {
        iframe.onload = resolve;
        iframe.onerror = reject;
        iframe.src = estimateUrl;
      });

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate PDF from iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      const pdfFilename = `Estimate_${estimateNumber}_${customerName.replace(
        /\s+/g,
        "_"
      )}.pdf`;

      const opt = {
        margin: 0,
        filename: pdfFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(iframeDoc.body).save();

      // Clean up iframe
      document.body.removeChild(iframe);

      setIsGeneratingPDF(false);

      // Step 2: Wait a moment for download to start
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 3: Show instruction modal and open WhatsApp
      const userConfirmed = confirm(
        `✅ PDF Downloaded: ${pdfFilename}\n\n` +
          `📱 Next Steps:\n` +
          `1. WhatsApp will open in a new tab\n` +
          `2. Click the 📎 (attach) button in WhatsApp\n` +
          `3. Select "Document" and attach the downloaded PDF\n` +
          `4. Send the message!\n\n` +
          `Click OK to open WhatsApp`
      );

      if (userConfirmed) {
        // Step 4: Open WhatsApp with helpful message
        const message = `Hello ${customerName}! 👋\n\nThank you for your interest in Mrudgandh services. 🌿\n\n📄 I'm attaching your estimate PDF: ${pdfFilename}\n\n${
          validUntil
            ? `✅ Valid until: ${new Date(validUntil).toLocaleDateString(
                "en-IN"
              )}\n`
            : ""
        }💰 Total Amount: ₹${totalAmount.toFixed(
          2
        )}\n\nFeel free to reach out for any questions!\n\nTeam Mrudgandh`;

        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
          message
        )}`;

        window.open(whatsappUrl, "_blank");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGeneratingPDF(false);
      alert(
        "❌ Failed to generate PDF. Please try again or use the Download button."
      );
    }
  };

  const handleCardClick = () => {
    navigate(`/estimate-preview?id=${booking.booking_slug}`);
  };

  const handleConvertToInvoice = (e) => {
    e.stopPropagation();
    navigate(`/invoice-preview?id=${booking.booking_slug}`);
  };

  // Get status badge
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    >
      {/* Header with gradient */}
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

        {/* Amount */}
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
            disabled={customerPhone === "N/A" || isGeneratingPDF}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isGeneratingPDF ? "Generating..." : "Send"}
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

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

const Transactions = () => {
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

      console.log("Total bookings fetched:", response.items.length);

      // Filter only estimates (document_type = "estimate")
      const estimateBookings = response.items.filter((booking) => {
        const items = booking._booking_items_of_bookings?.items || [];
        const firstItem = items[0];
        const bookingInfo = firstItem?.booking_items_info;
        const docType = bookingInfo?.document_type;

        console.log("Booking ID:", booking.id, "Document Type:", docType);

        // Include if document_type is "estimate" OR if it's not set (legacy estimates)
        return docType === "estimate" || !docType;
      });

      console.log("Filtered estimates:", estimateBookings.length);

      setBookings(estimateBookings);
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
  const totalAmount = bookings.reduce((sum, booking) => {
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

    return sum + bookingTotal;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
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
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => navigate("/generate-estimate")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-destructive px-4 py-2 text-sm font-medium text-white shadow-accent hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                New Estimate
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Estimates
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
              className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 p-4"
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 p-4"
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
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading estimates...</p>
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
              Error Loading Estimates
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

        {/* Transactions Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-12 text-center"
                >
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
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Create Your First Estimate
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

export default Transactions;
