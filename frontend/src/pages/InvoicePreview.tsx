import { useState, useEffect } from "react";
import { Download, Printer, X, Loader2, LayoutTemplate } from "lucide-react";
import { getBookingBySlugWithPublicAuth, getBookingWithPublicAuth, getShopInfoPublic } from "@/services/api";
import { logger } from "@/services/logger";
import ModernPurpleTemplate from "@/components/templates/ModernPurpleTemplate";
import FreshTealTemplate from "@/components/templates/FreshTealTemplate";

// Number to words converter
const numberToWords = (num: number): string => {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];
  const teens = [
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];

  if (num === 0) return "Zero";

  const convertLessThanThousand = (n: number): string => {
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


interface InvoiceData {
  customerInfo: any;
  invoiceDetails: any;
  items: any[];
  subtotal: number;
  cgst: number;
  sgst: number;
  cgstAmount: number;
  sgstAmount: number;
  total: number;
}

const InvoicePreview = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // Will be set from shop settings

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
        // Fetch booking by slug
        const bookingArray = await getBookingBySlugWithPublicAuth(bookingSlug);

        if (!bookingArray || bookingArray.length === 0) {
          throw new Error("Booking not found");
        }

        const booking = bookingArray[0];
        const bookingDetails = await getBookingWithPublicAuth(booking.id);

        const shopsId = bookingDetails._shop_info?.shops_id || bookingDetails.shops_id;

        if (shopsId) {
          try {
            const shopInfoData = await getShopInfoPublic(shopsId);
            if (shopInfoData && shopInfoData.shops_settings) {
              setShopInfo({
                logo_url: shopInfoData.shops_settings.logo_url || '',
                company_name: shopInfoData.shops_settings.company_name || '',
                address: shopInfoData.shops_settings.address || '',
                email: shopInfoData.shops_settings.email || '',
                phone: shopInfoData.shops_settings.phone || '',
                declaration: shopInfoData.shops_settings.declaration || '',
                bank_details: shopInfoData.shops_settings.bank_details || null,
                signature: shopInfoData.shops_settings.signature || '',
                gstin: shopInfoData.shops_settings.gstin || '',
                state: shopInfoData.shops_settings.state || ''
              });
              // Set the vendor's preferred template
              const preferredTemplate = shopInfoData.shops_settings.preferred_template || 'modern';
              setSelectedTemplate(preferredTemplate);
            }
          } catch (shopError) {
            logger.error('Failed to fetch shop info', shopError);
            // Fallback logic
            if (bookingDetails._customers?._shops) {
              const shop = bookingDetails._customers._shops;
              setShopInfo({
                logo_url: shop.logo || '',
                company_name: shop.name || '',
                address: shop.description || '',
                email: '', phone: '', declaration: '', bank_details: null, signature: '', gstin: '', state: ''
              });
            }
          }
        } else if (bookingDetails._customers?._shops) {
          const shop = bookingDetails._customers._shops;
          setShopInfo({
            logo_url: shop.logo || '',
            company_name: shop.name || '',
            address: shop.description || '',
            email: '', phone: '', declaration: '', bank_details: null, signature: '', gstin: '', state: ''
          });
        }

        const bookingItems = bookingDetails._booking_items_of_bookings?.items || [];

        const items = bookingItems.map((bookingItem: any) => {
          const itemDetails = bookingItem._items;
          const imageUrl = bookingItem.booking_items_info?.image_url || itemDetails?._item_images_of_items?.items?.[0]?.display_image || null;

          return {
            id: bookingItem.items_id,
            description: itemDetails?.title || "Item",
            quantity: bookingItem.quantity || 1,
            rate: parseFloat(bookingItem.price) || itemDetails?.price || 0,
            amount: (bookingItem.quantity || 1) * (parseFloat(bookingItem.price) || itemDetails?.price || 0),
            imageUrl: imageUrl,
            hsn_sac: itemDetails?.hsn_sac || '',
            gst: itemDetails?.gst || 0
          };
        });

        const firstBookingItem = bookingItems[0];
        const savedInvoiceData = firstBookingItem?.booking_items_info || {};

        const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const cgst = savedInvoiceData.tax_info?.cgst || 0;
        const sgst = savedInvoiceData.tax_info?.sgst || 0;
        const cgstAmount = (subtotal * cgst) / 100;
        const sgstAmount = (subtotal * sgst) / 100;
        const total = subtotal + cgstAmount + sgstAmount;

        setInvoiceData({
          customerInfo: {
            name: (savedInvoiceData.customer_info?.name || bookingDetails._customers?.Full_name || "").trim(),
            email: (savedInvoiceData.customer_info?.email || bookingDetails._customers?.email || "").trim(),
            phone: (savedInvoiceData.customer_info?.phone || bookingDetails._customers?.cust_info?.phone || "").trim(),
            address: (savedInvoiceData.customer_info?.address || bookingDetails._customers?.cust_info?.address || "").trim(),
            state: (savedInvoiceData.customer_info?.state || bookingDetails._customers?.cust_info?.state || "").trim(),
            gstin: (savedInvoiceData.customer_info?.gstin || bookingDetails._customers?.cust_info?.gstin || "").trim(),
          },
          invoiceDetails: {
            invoiceNumber: savedInvoiceData.invoice_details?.invoiceNumber || `INV - ${booking.id}`,
            date: savedInvoiceData.invoice_details?.date || new Date(booking.created_at).toISOString().split("T")[0],
            dueDate: savedInvoiceData.invoice_details?.dueDate || null,
          },
          items,
          subtotal,
          cgst,
          sgst,
          cgstAmount,
          sgstAmount,
          total
        });

        setLoading(false);

      } catch (err: any) {
        logger.error("Error loading invoice", err);
        setError(err.message || "Failed to load invoice");
        setLoading(false);
      }
    };

    fetchInvoice();
  }, []);

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => window.print();
  const handleClose = () => window.close(); // Using window.close for popup behavior or could use navigate('/')

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
          <p className="text-gray-800 font-semibold mb-2">Error Loading Invoice</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close Window</button>
        </div>
      </div>
    );
  }

  if (!invoiceData) return null;

  const { customerInfo, invoiceDetails, items, subtotal, cgst, sgst, cgstAmount, sgstAmount, total } = invoiceData;
  const amountInWords = numberToWords(Math.floor(total)) + " Rupees Only";

  const CompanyHeader = () => (
    <div className="flex justify-between items-start mb-6">
      <div>
        {shopInfo?.logo_url ? (
          <img
            src={shopInfo.logo_url}
            alt="Logo"
            className="h-14 mb-3 max-w-[200px] object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="h-14 mb-3 flex items-center">
            <p className="text-lg font-bold text-gray-800">{shopInfo?.company_name || "Company Name"}</p>
          </div>
        )}
        <div className="text-xs text-gray-700 space-y-0.5">
          {shopInfo?.address && <p><strong>Address:</strong> {shopInfo.address}</p>}
          {shopInfo?.email && <p><strong>Email:</strong> {shopInfo.email}</p>}
          {shopInfo?.phone && <p><strong>Phone:</strong> {shopInfo.phone}</p>}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-600 space-y-0.5">
          <p><strong>Invoice #:</strong> {invoiceDetails.invoiceNumber}</p>
          <p><strong>Date:</strong> {new Date(invoiceDetails.date).toLocaleDateString("en-IN")}</p>
          {invoiceDetails.dueDate && <p><strong>Due Date:</strong> {new Date(invoiceDetails.dueDate).toLocaleDateString("en-IN")}</p>}
        </div>
      </div>
    </div>
  );

  const renderStandardTemplate = () => (
    <div className="w-full md:max-w-[210mm] min-h-[297mm] mx-auto bg-white p-4 md:p-12 mb-8 print:mb-0 print:max-w-[210mm] print:p-12 shadow-lg md:shadow-none">
      <CompanyHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 mb-6 border border-gray-800">
        <div className="p-3 border-b md:border-b-0 md:border-r border-gray-800">
          <p className="font-semibold text-sm mb-2">Bill To Name – {customerInfo.name}</p>
          <p className="text-xs mb-2">Address: {customerInfo.address || "-"}</p>
        </div>
        <div className="p-3 border-b md:border-b-0 md:border-r border-gray-800">
          <p className="font-semibold text-sm mb-1">Invoice No. - {invoiceDetails.invoiceNumber}</p>
          <p className="font-semibold text-sm mb-1">Date - {new Date(invoiceDetails.date).toLocaleDateString("en-IN")}</p>
          <p className="text-xs mb-1 mt-3">Address: {customerInfo.address || "-"}</p>
          <p className="text-xs mb-1">State - {customerInfo.state || "-"}</p>
          <p className="text-xs mb-1">GSTIN - {customerInfo.gstin || "-"}</p>
        </div>
        <div className="p-3">
          <p className="font-semibold text-sm mb-1">Service Recipient</p>
          <p className="font-semibold text-sm mb-2">{customerInfo.name}</p>
          <p className="text-xs">Address:</p>
          <p className="text-xs">{customerInfo.address}</p>
          <p className="text-xs">{customerInfo.state}</p>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-800 min-w-[600px] md:min-w-0">
          <thead>
            <tr className="bg-white">
              <th className="border border-gray-800 p-2 text-center text-sm font-bold">QTY</th>
              <th className="border border-gray-800 p-2 text-left text-sm font-bold">DESCRIPTION</th>
              <th className="border border-gray-800 p-2 text-right text-sm font-bold">RATE (₹)</th>
              <th className="border border-gray-800 p-2 text-right text-sm font-bold">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index}>
                <td className="border border-gray-800 p-2 text-center text-sm">{item.quantity}</td>
                <td className="border border-gray-800 p-2 text-sm">{item.description}</td>
                <td className="border border-gray-800 p-2 text-right text-sm">₹{item.rate.toFixed(2)}</td>
                <td className="border border-gray-800 p-2 text-right text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="border border-gray-800 p-2 text-sm font-semibold">Grand Total</td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">₹{subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-gray-800 p-2 text-sm">{cgst}% CGST</td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">₹{cgstAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-gray-800 p-2 text-sm">{sgst}% SGST</td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">₹{sgstAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-gray-800 p-2 text-sm font-semibold">Net Amount Payable</td>
              <td className="border border-gray-800 p-2 text-right text-sm font-bold">₹{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border border-gray-800 p-2 mb-6">
        <p className="text-sm"><strong>Amount In Words:</strong> {amountInWords}</p>
      </div>

      <div className="mb-6">
        <p className="font-bold text-sm mb-2">Declaration:</p>
        {shopInfo?.declaration ? (
          <p className="text-xs text-gray-700 whitespace-pre-line">{shopInfo.declaration}</p>
        ) : (
          <p className="text-xs text-gray-700">We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.</p>
        )}
      </div>

      {/* Footer/Bank Details for Standard Template can optionally be on Page 2 or here. Copying minimal version here to save space or full version from EstimatePreview if page break needed. I'll include bank details block here. */}
      <div className="mb-8">
        <h2 className="font-bold text-base mb-4">Bank Details</h2>
        <div className="text-sm">
          {shopInfo?.bank_details ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <div>Bank Name:</div><div className="font-semibold">{shopInfo.bank_details.bank_name}</div>
              <div>Account No:</div><div className="font-semibold">{shopInfo.bank_details.account_number}</div>
              <div>IFSC Code:</div><div className="font-semibold">{shopInfo.bank_details.ifsc_code}</div>
            </div>
          ) : <p className="text-gray-500 italic">No bank details available</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="text-center">
          {shopInfo?.signature && (
            <img src={shopInfo.signature} alt="Sig" className="h-16 mb-2 object-contain" />
          )}
          <div className="w-48 border-t border-gray-800 pt-2"><p className="text-sm font-bold">Authorised Signatory</p></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-4 right-4 flex flex-col md:flex-row gap-2 print:hidden z-50">
        <button onClick={handlePrint} className="button-style px-4 py-2 bg-gray-100 rounded shadow text-sm flex gap-2 items-center"><Printer className="h-4 w-4" /> Print</button>
        <button onClick={handleDownloadPDF} className="button-style px-4 py-2 bg-green-600 text-white rounded shadow text-sm flex gap-2 items-center"><Download className="h-4 w-4" /> PDF</button>
        <button onClick={handleClose} className="button-style px-4 py-2 bg-red-100 text-red-700 rounded shadow text-sm flex gap-2 items-center"><X className="h-4 w-4" /></button>
      </div>

      {selectedTemplate === 'modern' ? (
        <ModernPurpleTemplate
          type="INVOICE"
          data={{
            shopInfo: shopInfo || {},
            customerInfo: customerInfo || {},
            documentDetails: {
              documentNumber: invoiceDetails.invoiceNumber,
              date: invoiceDetails.date,
              dueDate: invoiceDetails.dueDate,
              title: 'INVOICE'
            },
            items: items || [],
            totals: {
              subtotal,
              total,
              cgstAmount,
              sgstAmount,
              cgstRate: cgst,
              sgstRate: sgst,
              amountInWords
            }
          }}
        />
      ) : selectedTemplate === 'teal' ? (
        <FreshTealTemplate
          type="INVOICE"
          data={{
            shopInfo: shopInfo || {},
            customerInfo: customerInfo || {},
            documentDetails: {
              documentNumber: invoiceDetails.invoiceNumber,
              date: invoiceDetails.date,
              dueDate: invoiceDetails.dueDate,
              title: 'INVOICE'
            },
            items: items || [],
            totals: {
              subtotal,
              total,
              cgstAmount,
              sgstAmount,
              cgstRate: cgst,
              sgstRate: sgst,
              amountInWords
            }
          }}
        />
      ) : (
        renderStandardTemplate()
      )}
    </div>
  );
};

export default InvoicePreview;
