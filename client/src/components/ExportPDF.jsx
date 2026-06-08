// client/src/components/ExportPDF.jsx
// Exports the book as a downloadable PDF

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ExportPDF = ({ book, photos, pages }) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const colorSchemes = {
    blue: ["#2563eb", "#1e40af"],
    purple: ["#9333ea", "#6b21a8"],
    green: ["#16a34a", "#14532d"],
    rose: ["#e11d48", "#9f1239"],
    amber: ["#d97706", "#92400e"],
    gray: ["#374151", "#111827"],
  };

  const exportToPDF = async () => {
    setExporting(true);
    setProgress(0);

    try {
      // Create PDF in landscape A4 size
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const colors = colorSchemes[book?.color_scheme] || colorSchemes.blue;
      const totalPages = photos.length + 2; // photos + cover + back
      let currentPdfPage = 0;

      // ── Page 1: Cover ──────────────────────────────────
      setProgress(10);

      // Background gradient (simulate with solid color)
      pdf.setFillColor(colors[0]);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      // Cover image if available
      if (book?.cover_image_url) {
        try {
          const img = await loadImage(book.cover_image_url);
          pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);

          // Dark overlay
          pdf.setFillColor(0, 0, 0);
          pdf.setGState(new pdf.GState({ opacity: 0.5 }));
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        } catch (e) {
          console.log("Cover image load failed, using color background");
        }
      }

      // Cover text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text(book?.title || "My Travel Book", pdfWidth / 2, pdfHeight / 2 - 15, {
        align: "center",
      });

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        book?.cover_subtitle || "A journey to remember",
        pdfWidth / 2,
        pdfHeight / 2 + 5,
        { align: "center" }
      );

      pdf.setFontSize(10);
      pdf.text(
        book?.destination || "",
        pdfWidth / 2,
        pdfHeight / 2 + 20,
        { align: "center" }
      );

      currentPdfPage++;

      // ── Section Title Pages + Photo Pages ─────────────
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.layout === "cover") continue;

        // Section title page
        pdf.addPage();
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          page.section_title || `Section ${i}`,
          pdfWidth / 2,
          pdfHeight / 2,
          { align: "center" }
        );

        // Decorative line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(
          pdfWidth / 2 - 30,
          pdfHeight / 2 + 8,
          pdfWidth / 2 + 30,
          pdfHeight / 2 + 8
        );

        currentPdfPage++;
        setProgress(Math.floor((currentPdfPage / totalPages) * 80) + 10);

        // Photos for this section
        const sectionPhotos = photos.filter((p) => p.page_id === page.id);

        for (const photo of sectionPhotos) {
          pdf.addPage();

          // White background
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

          try {
            const img = await loadImage(photo.image_url);

            // Photo takes up most of the page
            const imgMargin = 15;
            const captionHeight = 20;
            const imgHeight = pdfHeight - captionHeight - imgMargin * 2;
            const imgWidth = pdfWidth - imgMargin * 2;

            pdf.addImage(
              img,
              "JPEG",
              imgMargin,
              imgMargin,
              imgWidth,
              imgHeight
            );

            // Caption
            if (photo.caption) {
              pdf.setTextColor(100, 100, 100);
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "italic");
              pdf.text(
                photo.caption,
                pdfWidth / 2,
                pdfHeight - imgMargin / 2,
                { align: "center", maxWidth: pdfWidth - 40 }
              );
            }

            // Page number
            pdf.setTextColor(180, 180, 180);
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              String(currentPdfPage),
              pdfWidth - 10,
              pdfHeight - 5,
              { align: "right" }
            );

          } catch (e) {
            console.log("Photo load failed:", photo.image_url);
          }

          currentPdfPage++;
          setProgress(Math.floor((currentPdfPage / totalPages) * 80) + 10);
        }
      }

      // If no pages, just add all photos directly
      if (pages.length <= 1) {
        for (const photo of photos) {
          pdf.addPage();
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

          try {
            const img = await loadImage(photo.image_url);
            const imgMargin = 15;
            const captionHeight = 20;
            pdf.addImage(
              img,
              "JPEG",
              imgMargin,
              imgMargin,
              pdfWidth - imgMargin * 2,
              pdfHeight - captionHeight - imgMargin * 2
            );

            if (photo.caption) {
              pdf.setTextColor(100, 100, 100);
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "italic");
              pdf.text(photo.caption, pdfWidth / 2, pdfHeight - 8, {
                align: "center",
                maxWidth: pdfWidth - 40,
              });
            }
          } catch (e) {
            console.log("Photo failed");
          }
          currentPdfPage++;
          setProgress(Math.floor((currentPdfPage / totalPages) * 80) + 10);
        }
      }

      // ── Last Page: Back Cover ──────────────────────────
      pdf.addPage();
      pdf.setFillColor(30, 30, 30);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Created with Travel Photo Book", pdfWidth / 2, pdfHeight / 2, {
        align: "center",
      });

      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        book?.destination || "",
        pdfWidth / 2,
        pdfHeight / 2 + 10,
        { align: "center" }
      );

      setProgress(100);

      // ── Download the PDF ───────────────────────────────
      const fileName = `${book?.title || "travel-book"}-${Date.now()}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  // Helper — load image as base64
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  return (
    <div>
      <button
        onClick={exportToPDF}
        disabled={exporting}
        className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
      >
        {exporting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Generating PDF... {progress}%
          </>
        ) : (
          "📄 Download PDF"
        )}
      </button>

      {/* Progress Bar */}
      {exporting && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ExportPDF;