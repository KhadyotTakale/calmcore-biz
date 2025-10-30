import React from "react";

const EstimatePDFGenerator = ({
  customerInfo,
  estimateDetails,
  items,
  subtotal,
  discount,
  discountAmount,
  tax,
  taxAmount,
  total,
}) => {
  // Function to convert image to base64
  const getBase64Image = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error loading image:", error);
      return null;
    }
  };

  const generatePDF = async () => {
    try {
      // Dynamically import libraries
      const html2canvas = (
        await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm")
      ).default;
      const { jsPDF } = await import(
        "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm"
      );

      // Try to load logo as base64
      let logoBase64 = null;
      try {
        logoBase64 = await getBase64Image(
          "https://mrudgandh.co.in/wp-content/uploads/2021/11/Mrudugandh_Marathi-Logo_4-300x133.jpg"
        );
      } catch (e) {
        console.warn("Could not load logo, proceeding without it");
      }

      // Create a hidden container for the PDF content
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.width = "210mm";
      pdfContainer.style.padding = "20mm";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.fontFamily = "Arial, sans-serif";

      const logoHtml = logoBase64
        ? `<img src="${logoBase64}" alt="Mrudgandh Logo" style="height: 60px; margin-bottom: 15px;" />`
        : `<div style="height: 60px; margin-bottom: 15px; display: flex; align-items: center;">
             <h2 style="margin: 0; color: #2c5f2d; font-size: 24px; font-weight: bold;">MRUDGANDH</h2>
           </div>`;

      pdfContainer.innerHTML = `
        <div style="max-width: 170mm; margin: 0 auto;">
          <!-- Header with Logo -->
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2c5f2d;">
            <div style="flex: 1;">
              ${logoHtml}
              <div style="font-size: 11px; line-height: 1.6; color: #333;">
                <p style="margin: 3px 0;"><strong>Address:</strong> Kodre Farm, Vadgaon Khurd,<br/>Behind Rajyog Society, Pune, MH 411068</p>
                <p style="margin: 3px 0;"><strong>Email:</strong> teammrudgandh@gmail.com</p>
                <p style="margin: 3px 0;"><strong>Phone:</strong> +91 9371711378 / +91 9850567505</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; color: #2c5f2d; margin: 0 0 10px 0; font-weight: bold;">ESTIMATE</h1>
              <div style="font-size: 11px; color: #666;">
                <p style="margin: 3px 0;"><strong>Estimate #:</strong> ${
                  estimateDetails.estimateNumber
                }</p>
                <p style="margin: 3px 0;"><strong>Date:</strong> ${new Date(
                  estimateDetails.date
                ).toLocaleDateString("en-IN")}</p>
                <p style="margin: 3px 0;"><strong>Valid Until:</strong> ${new Date(
                  estimateDetails.validUntil
                ).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 14px; color: #2c5f2d; margin: 0 0 10px 0; font-weight: bold;">BILL TO:</h3>
            <div style="font-size: 12px; line-height: 1.6; color: #333;">
              <p style="margin: 3px 0;"><strong>${
                customerInfo.name || "N/A"
              }</strong></p>
              ${
                customerInfo.email
                  ? `<p style="margin: 3px 0;">${customerInfo.email}</p>`
                  : ""
              }
              ${
                customerInfo.phone
                  ? `<p style="margin: 3px 0;">${customerInfo.phone}</p>`
                  : ""
              }
              ${
                customerInfo.address
                  ? `<p style="margin: 3px 0;">${customerInfo.address}</p>`
                  : ""
              }
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
            <thead>
              <tr style="background-color: #2c5f2d; color: white;">
                <th style="padding: 12px 8px; text-align: left; font-weight: bold; border: 1px solid #2c5f2d;">DESCRIPTION</th>
                <th style="padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #2c5f2d; width: 80px;">QTY</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: bold; border: 1px solid #2c5f2d; width: 100px;">RATE (₹)</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: bold; border: 1px solid #2c5f2d; width: 100px;">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, index) => `
                <tr style="background-color: ${
                  index % 2 === 0 ? "#ffffff" : "#f8f9fa"
                };">
                  <td style="padding: 10px 8px; border: 1px solid #dee2e6;">${
                    item.description || "No description"
                  }</td>
                  <td style="padding: 10px 8px; text-align: center; border: 1px solid #dee2e6;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px 8px; text-align: right; border: 1px solid #dee2e6;">₹${item.rate.toFixed(
                    2
                  )}</td>
                  <td style="padding: 10px 8px; text-align: right; border: 1px solid #dee2e6; font-weight: bold;">₹${item.amount.toFixed(
                    2
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="margin-left: auto; width: 300px; margin-bottom: 30px;">
            <table style="width: 100%; font-size: 12px;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${subtotal.toFixed(
                  2
                )}</td>
              </tr>
              ${
                discount > 0
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Discount (${discount}%):</td>
                <td style="padding: 8px 0; text-align: right; color: #dc3545; font-weight: bold;">-₹${discountAmount.toFixed(
                  2
                )}</td>
              </tr>
              `
                  : ""
              }
              ${
                tax > 0
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Tax (${tax}%):</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">+₹${taxAmount.toFixed(
                  2
                )}</td>
              </tr>
              `
                  : ""
              }
              <tr style="border-top: 2px solid #2c5f2d;">
                <td style="padding: 12px 0; font-size: 16px; font-weight: bold; color: #2c5f2d;">TOTAL:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #2c5f2d;">₹${total.toFixed(
                  2
                )}</td>
              </tr>
            </table>
          </div>

          <!-- Notes -->
          ${
            estimateDetails.notes
              ? `
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #2c5f2d; border-radius: 4px;">
            <h3 style="font-size: 12px; color: #2c5f2d; margin: 0 0 8px 0; font-weight: bold;">NOTES:</h3>
            <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 0; white-space: pre-line;">${estimateDetails.notes}</p>
          </div>
          `
              : ""
          }

          <!-- Terms & Conditions -->
          <div style="margin-bottom: 30px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
            <h3 style="font-size: 12px; color: #856404; margin: 0 0 8px 0; font-weight: bold;">TERMS & CONDITIONS:</h3>
            <p style="font-size: 10px; line-height: 1.5; color: #856404; margin: 0;">
              This estimate is valid until ${new Date(
                estimateDetails.validUntil
              ).toLocaleDateString("en-IN")}. 
              Prices are subject to change after this date. Payment terms and conditions apply.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 10px; color: #666;">
            <p style="margin: 5px 0;">Thank you for your business!</p>
            <p style="margin: 5px 0;">Copyright © 2025 Mrudgandh | Powered by Elegant Enterprises</p>
          </div>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      // Wait a bit for rendering
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate canvas from HTML
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Estimate_${estimateDetails.estimateNumber}.pdf`);

      document.body.removeChild(pdfContainer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return { generatePDF };
};

export default EstimatePDFGenerator;
