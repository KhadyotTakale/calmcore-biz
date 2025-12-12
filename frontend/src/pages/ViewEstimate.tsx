import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { loadCompleteEstimate } from "@/services/api";
import EstimatePDFGenerator from "@/components/estimate/EstimatePDFGenerator";
import { logger } from "@/services/logger";

const ViewEstimate = () => {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimateData, setEstimateData] = useState(null);

  const loadEstimate = useCallback(async () => {
    try {
      setLoading(true);
      const { booking, metadata } = await loadCompleteEstimate(
        parseInt(bookingId!)
      );

      if (!metadata) {
        setError("Estimate data not found");
        return;
      }

      setEstimateData(metadata);
    } catch (err: any) {
      logger.error("Error loading estimate", err);
      setError(err.message || "Failed to load estimate");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadEstimate();
  }, [loadEstimate]);

  const handleDownload = async () => {
    if (!estimateData) return;

    const pdfGenerator = EstimatePDFGenerator({
      customerInfo: estimateData.customerInfo,
      estimateDetails: {
        estimateNumber: estimateData.estimateNumber,
        date: estimateData.date,
        validUntil: estimateData.validUntil,
        notes: estimateData.notes,
      },
      items: estimateData.items,
      subtotal: estimateData.totals.subtotal,
      discount: estimateData.discount,
      discountAmount: estimateData.totals.discountAmount,
      tax: estimateData.tax,
      taxAmount: estimateData.totals.taxAmount,
      total: estimateData.totals.total,
    });

    await pdfGenerator.generatePDF();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Estimate</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!estimateData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Estimate #{estimateData.estimateNumber}
          </h1>
          <p className="text-muted-foreground">
            Valid until{" "}
            {new Date(estimateData.validUntil).toLocaleDateString("en-IN")}
          </p>
        </motion.div>

        {/* Estimate Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden mb-6"
        >
          {/* Company Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
            <h2 className="text-2xl font-bold mb-1">QUOTEBHAI</h2>
            <div className="text-sm space-y-1">
              <p>Kodre Farm, Vadgaon Khurd,</p>
              <p>Behind Rajyog Society, Pune, MH 411068</p>
              <p>Email: support@quotebhai.com</p>
              <p>Phone: +91 9371711378 / +91 9850567505</p>
            </div>
            {/* Divider */}
            <div className="border-t-2 border-primary my-6"></div>

            {/* View Title */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  ESTIMATE
                </h1>
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Estimate #:</span>{" "}
                    {estimateData.estimateNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(estimateData.date).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Valid Until:</span>{" "}
                    {new Date(estimateData.validUntil).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h3 className="text-sm font-bold text-primary mb-2 uppercase">
                Bill To:
              </h3>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {estimateData.customerInfo.name || "N/A"}
                </p>
                {/* We don't have customer address in the simple view yet, but could add if needed */}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-3 text-left">DESCRIPTION</th>
                    <th className="p-3 text-center w-20">QTY</th>
                    <th className="p-3 text-right w-24">RATE</th>
                    <th className="p-3 text-right w-24">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estimateData.items.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ₹{estimateData.totals.subtotal.toFixed(2)}
                  </span>
                </div>
                {estimateData.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({estimateData.discount}%):</span>
                    <span className="font-semibold">
                      -₹{estimateData.totals.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {estimateData.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({estimateData.tax}%):</span>
                    <span className="font-semibold">
                      +₹{estimateData.totals.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-primary pt-2 text-base font-bold text-primary">
                  <span>TOTAL:</span>
                  <span>₹{estimateData.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {estimateData.notes && (
              <div className="mb-6 bg-gray-50 p-4 border-l-4 border-primary rounded-r">
                <h3 className="text-xs font-bold text-primary mb-1 uppercase">
                  Notes:
                </h3>
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {estimateData.notes}
                </p>
              </div>
            )}

            {/* Terms */}
            <div className="mb-8 bg-yellow-50 p-4 border border-yellow-200 rounded">
              <h3 className="text-xs font-bold text-yellow-800 mb-1 uppercase">
                Terms & Conditions:
              </h3>
              <p className="text-xs text-yellow-800">
                This estimate is valid until{" "}
                {new Date(estimateData.validUntil).toLocaleDateString("en-IN")}.
                Payment terms apply.
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200 text-xs text-gray-500">
              <p className="mb-1">Thank you for your business!</p>
              <p>Copyright © 2025 QuoteBhai | Powered by Elegant Enterprises</p>
            </div>
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>Thank you for your business!</p>
          <p className="mt-1">
            © 2025 Mrudgandh | Powered by Elegant Enterprises
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewEstimate;
