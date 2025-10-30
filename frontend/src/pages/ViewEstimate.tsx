import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { loadCompleteEstimate } from "@/services/api";
import EstimatePDFGenerator from "@/components/estimate/EstimatePDFGenerator";

const ViewEstimate = () => {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimateData, setEstimateData] = useState(null);

  useEffect(() => {
    loadEstimate();
  }, [bookingId]);

  const loadEstimate = async () => {
    try {
      setLoading(true);
      const { booking, metadata } = await loadCompleteEstimate(
        parseInt(bookingId)
      );

      if (!metadata) {
        setError("Estimate data not found");
        return;
      }

      setEstimateData(metadata);
    } catch (err) {
      console.error("Error loading estimate:", err);
      setError(err.message || "Failed to load estimate");
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-2xl font-bold mb-1">MRUDGANDH</h2>
            <p className="text-sm opacity-90">
              Kodre Farm, Vadgaon Khurd, Pune, MH 411068
            </p>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              BILL TO:
            </h3>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                {estimateData.customerInfo.name}
              </p>
              {estimateData.customerInfo.email && (
                <p className="text-sm text-muted-foreground">
                  {estimateData.customerInfo.email}
                </p>
              )}
              {estimateData.customerInfo.phone && (
                <p className="text-sm text-muted-foreground">
                  {estimateData.customerInfo.phone}
                </p>
              )}
              {estimateData.customerInfo.address && (
                <p className="text-sm text-muted-foreground">
                  {estimateData.customerInfo.address}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 text-sm font-semibold text-muted-foreground">
                      DESCRIPTION
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground">
                      QTY
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                      RATE
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estimateData.items.map((item, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 text-foreground">
                        {item.description}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-semibold text-foreground">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 ml-auto w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  ₹{estimateData.totals.subtotal.toFixed(2)}
                </span>
              </div>
              {estimateData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount ({estimateData.discount}%):
                  </span>
                  <span className="font-medium text-destructive">
                    -₹{estimateData.totals.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {estimateData.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax ({estimateData.tax}%):
                  </span>
                  <span className="font-medium">
                    +₹{estimateData.totals.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-primary">
                <span className="font-bold text-lg text-foreground">
                  TOTAL:
                </span>
                <span className="font-bold text-lg text-primary">
                  ₹{estimateData.totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimateData.notes && (
            <div className="p-6 bg-muted/30 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                NOTES:
              </h3>
              <p className="text-sm text-foreground whitespace-pre-line">
                {estimateData.notes}
              </p>
            </div>
          )}
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
