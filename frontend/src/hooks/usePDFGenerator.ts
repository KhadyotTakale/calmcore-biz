import { useState, useCallback } from "react";
import html2pdf from "html2pdf.js";

interface PDFGeneratorOptions {
  bookingSlug: string;
  customerName: string;
  customerPhone: string;
  estimateNumber: string;
  totalAmount: number;
  validUntil?: string;
}

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadPDF = useCallback(
    async (options: PDFGeneratorOptions) => {
      const {
        bookingSlug,
        customerName,
        customerPhone,
        estimateNumber,
        totalAmount,
        validUntil,
      } = options;

      try {
        setIsGenerating(true);

        const phone = customerPhone.replace(/\D/g, "");
        const estimateUrl = `${window.location.origin}/estimate-preview?id=${bookingSlug}`;

        // Step 1: Create hidden iframe
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        // Step 2: Load estimate in iframe
        await new Promise((resolve, reject) => {
          iframe.onload = resolve;
          iframe.onerror = reject;
          iframe.src = estimateUrl;
        });

        // Step 3: Wait for content to render
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 4: Generate PDF
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;

        if (!iframeDoc) {
          throw new Error("Unable to access iframe document");
        }

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

        // Step 5: Clean up iframe
        document.body.removeChild(iframe);

        setIsGenerating(false);

        // Step 6: Wait for download to start
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Step 7: Show instructions and open WhatsApp
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
        setIsGenerating(false);
        alert(
          "❌ Failed to generate PDF. Please try again or use the Download button."
        );
      }
    },
    []
  );

  return {
    generateAndDownloadPDF,
    isGenerating,
  };
};
