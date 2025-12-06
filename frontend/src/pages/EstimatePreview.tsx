import { useState, useEffect } from "react";
import { Download, Printer, X, Loader2 } from "lucide-react";
import { getBookingBySlug, getBooking, getShopInfo } from "@/services/api";

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

const EstimatePreview = () => {
  const [estimateData, setEstimateData] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingSlug = urlParams.get("id");

      if (!bookingSlug) {
        setError("No booking ID provided in URL");
        setLoading(false);
        return;
      }

      try {
        console.log("[EstimatePreview] Fetching booking:", bookingSlug);

        // Fetch shop info first
        let shopData = null;
        try {
          const shopInfoResponse = await getShopInfo();
          shopData = shopInfoResponse.shops_settings;
          setShopInfo(shopData);
          console.log("[EstimatePreview] Shop info loaded:", shopData);
        } catch (shopErr) {
          console.error("[EstimatePreview] Failed to load shop info:", shopErr);
          // Continue without shop info - use defaults
        }

        // Get booking by slug (uses customer auth internally)
        const bookingArray = await getBookingBySlug(bookingSlug);

        console.log("[EstimatePreview] Booking response:", bookingArray);

        if (!bookingArray || bookingArray.length === 0) {
          throw new Error("Booking not found");
        }

        const booking = bookingArray[0];
        const bookingDetails = await getBooking(booking.id);
        const bookingItems =
          bookingDetails._booking_items_of_bookings?.items || [];

        // Build items array from API data
        const items = bookingItems.map((bookingItem) => {
          const itemDetails = bookingItem._items;
          const imageUrl =
            bookingItem.booking_items_info?.image_url ||
            itemDetails?._item_images_of_items?.items?.[0]?.display_image ||
            null;

          return {
            id: bookingItem.items_id,
            description: itemDetails?.title || "Item",
            quantity: bookingItem.quantity || 1,
            rate: parseFloat(bookingItem.price) || itemDetails?.price || 0,
            amount:
              (bookingItem.quantity || 1) *
              (parseFloat(bookingItem.price) || itemDetails?.price || 0),
            imageUrl: imageUrl,
          };
        });

        // Calculate totals (use default tax rates if not stored)
        const firstBookingItem = bookingItems[0];
        const savedEstimateData = firstBookingItem?.booking_items_info || {};

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const discount = savedEstimateData.tax_info?.discount || 0;
        const cgst = savedEstimateData.tax_info?.cgst || 9;
        const sgst = savedEstimateData.tax_info?.sgst || 9;
        const discountAmount = 0;
        const taxableAmount = subtotal;
        const cgstAmount = (taxableAmount * cgst) / 100;
        const sgstAmount = (taxableAmount * sgst) / 100;
        const total = taxableAmount + cgstAmount + sgstAmount;

        // Build estimate data from API
        setEstimateData({
          customerInfo: {
            name:
              (savedEstimateData.customer_info?.name &&
                savedEstimateData.customer_info.name.trim()) ||
              (bookingDetails._customers?.Full_name &&
                bookingDetails._customers.Full_name.trim()) ||
              "Customer",
            email:
              (savedEstimateData.customer_info?.email &&
                savedEstimateData.customer_info.email.trim()) ||
              (bookingDetails._customers?.email &&
                bookingDetails._customers.email.trim()) ||
              "",
            phone:
              (savedEstimateData.customer_info?.phone &&
                savedEstimateData.customer_info.phone.trim()) ||
              (bookingDetails._customers?.cust_info?.phone &&
                bookingDetails._customers.cust_info.phone.trim()) ||
              "",
            address:
              (savedEstimateData.customer_info?.address &&
                savedEstimateData.customer_info.address.trim()) ||
              (bookingDetails._customers?.cust_info?.address &&
                bookingDetails._customers.cust_info.address.trim()) ||
              "",
            state:
              (savedEstimateData.customer_info?.state &&
                savedEstimateData.customer_info.state.trim()) ||
              (bookingDetails._customers?.cust_info?.state &&
                bookingDetails._customers.cust_info.state.trim()) ||
              "",
            gstin:
              (savedEstimateData.customer_info?.gstin &&
                savedEstimateData.customer_info.gstin.trim()) ||
              (bookingDetails._customers?.cust_info?.gstin &&
                bookingDetails._customers.cust_info.gstin.trim()) ||
              "",
          },
          estimateDetails: {
            estimateNumber:
              savedEstimateData.estimate_details?.estimateNumber ||
              `EST-${booking.id}`,
            date:
              savedEstimateData.estimate_details?.date ||
              new Date(booking.created_at).toISOString().split("T")[0],
            validUntil:
              savedEstimateData.estimate_details?.validUntil ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            notes: savedEstimateData.special_instructions || "",
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
        console.error("Error loading estimate:", err);
        setError(err.message || "Failed to load estimate");
        setLoading(false);
      }
    };

    fetchEstimate();
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
        <p className="text-gray-600">Loading estimate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold mb-2">
            Error Loading Estimate
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

  if (!estimateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No estimate data found</p>
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
    estimateDetails,
    items,
    subtotal,
    discount,
    discountAmount,
    cgst,
    cgstAmount,
    sgst,
    sgstAmount,
    total,
  } = estimateData;

  const amountInWords = numberToWords(Math.floor(total)) + " Rupees Only";

  // Helper function to render company header
  const CompanyHeader = () => (
    <div className="flex justify-between items-start mb-6">
      <div>
        {shopInfo?.logo_url ? (
          <img
            src={shopInfo.logo_url}
            alt={`${shopInfo.company_name || "Company"} Logo`}
            className="h-14 mb-3 max-w-[200px] object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="h-14 mb-3 flex items-center">
            <p className="text-lg font-bold text-gray-800">
              {shopInfo?.company_name || "Company Name"}
            </p>
          </div>
        )}
        <div className="text-xs text-gray-700 space-y-0.5">
          {shopInfo?.address && (
            <p>
              <strong>Address:</strong> {shopInfo.address}
            </p>
          )}
          {shopInfo?.email && (
            <p>
              <strong>Email:</strong> {shopInfo.email}
            </p>
          )}
          {shopInfo?.phone && (
            <p>
              <strong>Phone:</strong> {shopInfo.phone}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-600 space-y-0.5">
          <p>
            <strong>Estimate #:</strong> {estimateDetails.estimateNumber}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(estimateDetails.date).toLocaleDateString("en-IN")}
          </p>
          <p>
            <strong>Valid Until:</strong>{" "}
            {new Date(estimateDetails.validUntil).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );

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
        <CompanyHeader />

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
              Estimate No. - {estimateDetails.estimateNumber}
            </p>
            <p className="font-semibold text-sm mb-1">
              Date -{" "}
              {new Date(estimateDetails.date).toLocaleDateString("en-IN")}
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

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-800 mb-4">
          <thead>
            <tr className="bg-white">
              <th className="border border-gray-800 p-2 text-left text-sm font-bold">
                IMAGE
              </th>
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
                <td className="border border-gray-800 p-2 text-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.description}
                      className="w-12 h-12 object-cover rounded mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs mx-auto">
                      No img
                    </div>
                  )}
                </td>
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
                colSpan="4"
                className="border border-gray-800 p-2 text-sm font-semibold"
              >
                Grand Total
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{subtotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="border border-gray-800 p-2 text-sm">
                {cgst}% CGST
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{cgstAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="border border-gray-800 p-2 text-sm">
                {sgst}% SGST
              </td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">
                ₹{sgstAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan="4"
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
          {shopInfo?.declaration ? (
            <p className="text-xs text-gray-700 whitespace-pre-line">
              {shopInfo.declaration}
            </p>
          ) : (
            <ol className="list-decimal list-inside text-xs space-y-1 text-gray-700">
              <li>
                I/We declare that this estimate shows the actual price of
                services described and that all particulars are true and
                correct.
              </li>
            </ol>
          )}
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 print:page-break-before-always">
        {/* Header */}
        <CompanyHeader />

        {/* Bank Details */}
        <div className="mb-8">
          <h2 className="font-bold text-base mb-4">
            Bank Details for NEFT/RTGS
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <p>
                Beneficiary Name -{" "}
                <strong>
                  {shopInfo?.bank_details?.beneficiary_name || "-"}
                </strong>
              </p>
              <p>
                Name of the Bank -{" "}
                <strong>{shopInfo?.bank_details?.bank_name || "-"}</strong>
              </p>
              <p>
                Branch -{" "}
                <strong>{shopInfo?.bank_details?.branch || "-"}</strong>
              </p>
              <p>
                IFSC Code -{" "}
                <strong>{shopInfo?.bank_details?.ifsc_code || "-"}</strong>
              </p>
            </div>
            <div>
              <p>
                Account No. -{" "}
                <strong>{shopInfo?.bank_details?.account_number || "-"}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* For Customer */}
        <div className="mb-16">
          <p className="text-sm mb-8">
            For {shopInfo?.company_name || customerInfo.name}
          </p>
        </div>

        {/* Signature */}
        <div className="text-left mt-32">
          {shopInfo?.signature ? (
            <div>
              <img
                src={shopInfo.signature}
                alt="Signature"
                className="h-16 mb-2 max-w-[150px] object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <p className="text-sm">Authorized Signatory</p>
            </div>
          ) : (
            <p className="text-sm">Signature</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimatePreview;
