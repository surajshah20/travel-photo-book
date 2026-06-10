// client/src/components/ExportPDF.jsx
// Exports the book as a downloadable PDF

import { useState } from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

const ExportPDF = ({ book, photos, pages }) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const colorSchemes = {
    rose: ["#e11d48", "#9f1239"],
    blue: ["#2563eb", "#1e40af"],
    purple: ["#9333ea", "#6b21a8"],
    green: ["#16a34a", "#14532d"],
    amber: ["#d97706", "#92400e"],
    gray: ["#374151", "#111827"],
  };

  // ─── Load image as base64 with CORS fix ───────────────
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      // Add Cloudinary CORS bypass
      const corsUrl = url.includes("cloudinary.com")
        ? url.replace("/upload/", "/upload/fl_attachment/")
        : url;

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Full resolution — no downscaling
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // Maximum quality
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      };

      img.onerror = () => {
        // Fallback without modification
        const fallback = new Image();
        fallback.crossOrigin = "anonymous";
        fallback.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = fallback.naturalWidth;
          canvas.height = fallback.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(fallback, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 1.0));
        };
        fallback.onerror = reject;
        fallback.src = url;
      };

      img.src = corsUrl;
    });
  };

  const exportToPDF = async () => {
    setExporting(true);
    setProgress(0);

    try {
      // High quality PDF — no compression
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: false,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const colors = colorSchemes[book?.color_scheme] || colorSchemes.rose;
      const totalPages = photos.length + 2;
      let currentPdfPage = 0;

      // ── Cover Page ──────────────────────────────────────
      setProgress(10);
      pdf.setFillColor(colors[0]);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      if (book?.cover_image_url) {
        try {
          const img = await loadImage(book.cover_image_url);
          pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
          // Dark overlay effect
          pdf.setFillColor(0, 0, 0);
          pdf.setGState(new pdf.GState({ opacity: 0.45 }));
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        } catch (e) {
          console.log("Cover image failed, using color");
        }
      }

      // Cover text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        book?.title || "My Travel Book",
        pdfWidth / 2,
        pdfHeight / 2 - 15,
        { align: "center" }
      );

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

      // ── Section + Photo Pages ───────────────────────────
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
        pdf.setDrawColor(220, 220, 220);
        pdf.line(
          pdfWidth / 2 - 30,
          pdfHeight / 2 + 10,
          pdfWidth / 2 + 30,
          pdfHeight / 2 + 10
        );

        currentPdfPage++;
        setProgress(Math.floor((currentPdfPage / totalPages) * 80) + 10);

        // Photos in this section
        const sectionPhotos = photos.filter((p) => p.page_id === page.id);

        for (const photo of sectionPhotos) {
          pdf.addPage();
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

          try {
            const img = await loadImage(photo.image_url);
            const margin = 12;
            const captionH = 18;
            const imgW = pdfWidth - margin * 2;
            const imgH = pdfHeight - captionH - margin * 2;

            pdf.addImage(img, "JPEG", margin, margin, imgW, imgH);

            if (photo.caption) {
              pdf.setTextColor(120, 120, 120);
              pdf.setFontSize(9);
              pdf.setFont("helvetica", "italic");
              pdf.text(
                photo.caption,
                pdfWidth / 2,
                pdfHeight - margin / 2,
                { align: "center", maxWidth: pdfWidth - 40 }
              );
            }

            pdf.setTextColor(200, 200, 200);
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              String(currentPdfPage),
              pdfWidth - 10,
              pdfHeight - 5,
              { align: "right" }
            );
          } catch (e) {
            console.log("Photo failed:", photo.image_url);
          }

          currentPdfPage++;
          setProgress(Math.floor((currentPdfPage / totalPages) * 80) + 10);
        }
      }

      // ── No sections — just all photos ──────────────────
      if (pages.length <= 1) {
        for (const photo of photos) {
          pdf.addPage();
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

          try {
            const img = await loadImage(photo.image_url);
            const margin = 12;
            const captionH = 18;

            pdf.addImage(
              img, "JPEG",
              margin, margin,
              pdfWidth - margin * 2,
              pdfHeight - captionH - margin * 2
            );

            if (photo.caption) {
              pdf.setTextColor(120, 120, 120);
              pdf.setFontSize(9);
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

      // ── Back Cover ──────────────────────────────────────
      pdf.addPage();
      pdf.setFillColor(20, 20, 20);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("blushbook", pdfWidth / 2, pdfHeight / 2 - 5, {
        align: "center",
      });

      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        book?.destination || "",
        pdfWidth / 2,
        pdfHeight / 2 + 8,
        { align: "center" }
      );

      setProgress(100);

      // ── Save ────────────────────────────────────────────
      const fileName = `${(book?.title || "blushbook").toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <button
        onClick={exportToPDF}
        disabled={exporting}
        className="flex items-center gap-2 border border-gray-600 text-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gray-700 transition disabled:opacity-50"
      >
        {exporting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            {progress}%
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </>
        )}
      </button>

      {exporting && (
        <div className="mt-2 w-32 bg-gray-700 rounded-full h-1">
          <div
            className="bg-rose-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ExportPDF;