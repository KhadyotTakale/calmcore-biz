import { useState, useEffect } from "react";
import { Download, Printer, X, Loader2 } from "lucide-react";
import { getBookingBySlug, getBooking } from "@/services/api";

// Number to words converter
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + convertLessThanThousand(n % 100) : "")
    );
  };

  if (num < 1000) return convertLessThanThousand(num);
  if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      convertLessThanThousand(thousands) +
      " Thousand" +
      (remainder ? " " + convertLessThanThousand(remainder) : "")
    );
  }
  if (num < 10000000) {
    const lakhs = Math.floor(num / 100000);
    const remainder = num % 100000;
    return (
      convertLessThanThousand(lakhs) +
      " Lakh" +
      (remainder ? " " + numberToWords(remainder) : "")
    );
  }
  const crores = Math.floor(num / 10000000);
  const remainder = num % 10000000;
  return (
    convertLessThanThousand(crores) +
    " Crore" +
    (remainder ? " " + numberToWords(remainder) : "")
  );
};

const InvoicePreview = () => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingSlug = urlParams.get("id");

      if (!bookingSlug) {
        setError("No booking ID provided in URL");
        setLoading(false);
        return;
      }

      try {
        // Get booking by slug
        const bookingArray = await getBookingBySlug(bookingSlug);
        if (!bookingArray || bookingArray.length === 0) {
          throw new Error("Booking not found");
        }

        const booking = bookingArray[0];
        const bookingDetails = await getBooking(booking.id);

        // Get booking items with details
        const bookingItems =
          bookingDetails._booking_items_of_bookings?.items || [];

        // Build items array from API data (without images)
        const items = bookingItems.map((bookingItem) => {
          const itemDetails = bookingItem._items;

          return {
            id: bookingItem.items_id,
            description: itemDetails?.title || "Item",
            quantity: bookingItem.quantity || 1,
            rate: parseFloat(bookingItem.price) || itemDetails?.price || 0,
            amount:
              (bookingItem.quantity || 1) *
              (parseFloat(bookingItem.price) || itemDetails?.price || 0),
          };
        });

        // Calculate totals (use default tax rates if not stored)
        const firstBookingItem = bookingItems[0];
        const savedInvoiceData = firstBookingItem?.booking_items_info || {};

        // Calculate totals using saved tax rates
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const discount = savedInvoiceData.tax_info?.discount || 0;
        const cgst = savedInvoiceData.tax_info?.cgst || 9;
        const sgst = savedInvoiceData.tax_info?.sgst || 9;
        const discountAmount = 0;
        const taxableAmount = subtotal;
        const cgstAmount = (taxableAmount * cgst) / 100;
        const sgstAmount = (taxableAmount * sgst) / 100;
        const total = taxableAmount + cgstAmount + sgstAmount;

        // Build invoice data from API
        setInvoiceData({
          customerInfo: {
            name:
              savedInvoiceData.customer_info?.name ||
              bookingDetails._customers?.Full_name ||
              "Customer",
            email:
              savedInvoiceData.customer_info?.email ||
              bookingDetails._customers?.email ||
              "",
            phone:
              savedInvoiceData.customer_info?.phone ||
              bookingDetails._customers?.cust_info?.phone ||
              "",
            address:
              savedInvoiceData.customer_info?.address ||
              bookingDetails._customers?.cust_info?.address ||
              "",
            state:
              savedInvoiceData.customer_info?.state ||
              bookingDetails._customers?.cust_info?.state ||
              "",
            gstin:
              savedInvoiceData.customer_info?.gstin ||
              bookingDetails._customers?.cust_info?.gstin ||
              "",
          },
          invoiceDetails: {
            invoiceNumber:
              savedInvoiceData.invoice_details?.invoiceNumber ||
              // Extract number from EST-001 and convert to INV-001
              (savedInvoiceData.estimate_details?.estimateNumber
                ? savedInvoiceData.estimate_details.estimateNumber.replace(
                    "EST-",
                    "INV-"
                  )
                : `INV-${booking.id.toString().padStart(3, "0")}`), // Fallback
            date:
              savedInvoiceData.estimate_details?.date || // Use estimate date
              savedInvoiceData.invoice_details?.date ||
              new Date(booking.created_at).toISOString().split("T")[0],
            dueDate:
              savedInvoiceData.estimate_details?.validUntil || // Use estimate validUntil as dueDate
              savedInvoiceData.invoice_details?.dueDate ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            notes: savedInvoiceData.special_instructions || "",
          },
          items,
          subtotal,
          discount,
          discountAmount,
          cgst,
          cgstAmount,
          sgst,
          sgstAmount,
          total,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading invoice:", err);
        setError(err.message || "Failed to load invoice");
        setLoading(false);
      }
    };

    fetchInvoice();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold mb-2">
            Error Loading Invoice
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No invoice data found</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const {
    customerInfo,
    invoiceDetails,
    items,
    subtotal,
    discount,
    discountAmount,
    cgst,
    cgstAmount,
    sgst,
    sgstAmount,
    total,
  } = invoiceData;

  const amountInWords = numberToWords(Math.floor(total)) + " Rupees Only";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Buttons - Hidden when printing */}
      <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow transition-colors"
          title="Print"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-colors"
          title="Download PDF"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg shadow transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* PAGE 1 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 mb-8 print:mb-0 print:page-break-after-always">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <img
              src="https://mrudgandh.co.in/wp-content/uploads/2021/11/Mrudugandh_Marathi-Logo_4-300x133.jpg"
              alt="Mrudgandh Logo"
              className="h-14 mb-3"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="text-xs text-gray-700 space-y-0.5">
              <p>
                <strong>Address:</strong> Kodre Farm, Vadgaon Khurd,
              </p>
              <p>Behind Rajyog Society, Pune, MH 411068</p>
              <p>
                <strong>Email:</strong> teammrudgandh@gmail.com
              </p>
              <p>
                <strong>Phone:</strong> +91 9371711378 / +91 9850567505
              </p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-green-700 mb-2">INVOICE</h1>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>
                <strong>Invoice #:</strong>
                {invoiceDetails.invoiceNumber}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(invoiceDetails.date).toLocaleDateString("en-IN")}
              </p>
              <p>
                <strong>Due Date:</strong>
                {new Date(invoiceDetails.dueDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="grid grid-cols-3 gap-4 mb-6 border border-gray-800">
          <div className="p-3 border-r border-gray-800">
            <p className="font-semibold text-sm mb-2">
              Bill To Name – {customerInfo.name}
            </p>
            <p className="text-xs mb-2">
              Address: {customerInfo.address || "-"}
            </p>
          </div>
          <div className="p-3 border-r border-gray-800">
            <p className="font-semibold text-sm mb-1">
              Invoice No. - {invoiceDetails.invoiceNumber}
            </p>
            <p className="font-semibold text-sm mb-1">
              Date - {new Date(invoiceDetails.date).toLocaleDateString("en-IN")}
            </p>
            <p className="text-xs mb-1 mt-3">
              Address: {customerInfo.address || "-"}
            </p>
            <p className="text-xs mb-1">State - {customerInfo.state || "-"}</p>
            <p className="text-xs mb-1">GSTIN - {customerInfo.gstin || "-"}</p>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm mb-1">Service Recipient</p>
            <p className="font-semibold text-sm mb-2">{customerInfo.name}</p>
            <p className="text-xs">Address:</p>
            {customerInfo.address && (
              <p className="text-xs">{customerInfo.address}</p>
            )}
            {customerInfo.state && (
              <p className="text-xs">{customerInfo.state}</p>
            )}
          </div>
        </div>

        {/* Items Table - WITHOUT IMAGE COLUMN */}
        <table className="w-full border-collapse border border-gray-800 mb-4">
          <thead>
            <tr className="bg-white">
              <th className="border border-gray-800 p-2 text-left text-sm font-bold">
                DESCRIPTION
              </th>
              <th className="border border-gray-800 p-2 text-center text-sm font-bold">
                QTY
              </th>
              <th className="border border-gray-800 p-2 text-right text-sm font-bold">
                RATE (₹)
              </th>
              <th className="border border-gray-800 p-2 text-right text-sm font-bold">
                AMOUNT (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-800 p-2 text-sm">
                  {item.description}
                </td>
                <td className="border border-gray-800 p-2 text-center text-sm">
                  {item.quantity}
                </td>
                <td className="border border-gray-800 p-2 text-right text-sm">
                  ₹{item.rate.toFixed(2)}
                </td>
                <td className="border border-gray-800 p-2 text-right text-sm font-semibold">
                  ₹{item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan="3"
                className="border border-gray-800 p-2 text-sm font-semibold"
              >
                Grand Total
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{subtotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="border border-gray-800 p-2 text-sm">
                {cgst}% CGST
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{cgstAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="border border-gray-800 p-2 text-sm">
                {sgst}% SGST
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{sgstAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan="3"
                className="border border-gray-800 p-2 text-sm font-semibold"
              >
                Net Amount Payable
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border border-gray-800 p-2 mb-6">
          <p className="text-sm">
            <strong>Amount In Words:</strong> {amountInWords}
          </p>
        </div>

        {/* Declaration */}
        <div className="mb-6">
          <p className="font-bold text-sm mb-2">Declaration:</p>
          <ol className="list-decimal list-inside text-xs space-y-1 text-gray-700">
            <li>
              I/We declare that this invoice shows the actual price of services
              described and that all particulars are true and correct.
            </li>
            <li>
              Error and Omission in this invoice shall be subject to the Pune
              Jurisdiction of Pune City.
            </li>
          </ol>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 print:page-break-before-always">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <img
              src="https://mrudgandh.co.in/wp-content/uploads/2021/11/Mrudugandh_Marathi-Logo_4-300x133.jpg"
              alt="Mrudgandh Logo"
              className="h-14 mb-3"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="text-xs text-gray-700 space-y-0.5">
              <p>
                <strong>Address:</strong> Kodre Farm, Vadgaon Khurd,
              </p>
              <p>Behind Rajyog Society, Pune, MH 411068</p>
              <p>
                <strong>Email:</strong> teammrudgandh@gmail.com
              </p>
              <p>
                <strong>Phone:</strong> +91 9371711378 / +91 9850567505
              </p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-green-700 mb-2">INVOICE</h1>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>
                <strong>Invoice #:</strong>
                {invoiceDetails.invoiceNumber}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(invoiceDetails.date).toLocaleDateString("en-IN")}
              </p>
              <p>
                <strong>Due Date:</strong>
                {new Date(invoiceDetails.dueDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-8">
          <h2 className="font-bold text-base mb-4">
            Bank Details for NEFT/RTGS
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <p>Beneficiary Name -</p>
              <p>Name of the Bank -</p>
              <p>
                <strong>Pune</strong>
              </p>
              <p>IFSC Code -</p>
            </div>
            <div>
              <p>Account No.-</p>
              <p>Branch -</p>
            </div>
          </div>
        </div>

        {/* For Customer */}
        <div className="mb-16">
          <p className="text-sm mb-8">For {customerInfo.name}</p>
        </div>

        {/* Signature */}
        <div className="text-left mt-32">
          <p className="text-sm">Signature</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
