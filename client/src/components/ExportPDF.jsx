// client/src/components/ExportPDF.jsx
// Exports the book as a downloadable PDF

import { useState } from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

const ExportPDF = ({ book, photos, pages }) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // ─── Theme Configurations ─────────────────────────────
  const getThemeConfig = (colorScheme, fontStyle) => {
    const font = fontStyle === "serif" ? "times" : "helvetica";
    
    switch (colorScheme) {
      case "purple": // Luxury
        return { bg: [17, 24, 39], text: [255, 255, 255], font };
      case "amber": // Vintage
        return { bg: [254, 243, 199], text: [120, 53, 15], font };
      case "green": // Scrapbook
        return { bg: [248, 250, 252], text: [6, 78, 59], font };
      case "blue": // Journal
        return { bg: [255, 255, 255], text: [30, 58, 138], font };
      default: // Modern/Rose
        return { bg: [255, 255, 255], text: [15, 15, 15], font };
    }
  };

  // ─── Bulletproof Image Loader ─────────────────────────
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      // 1. Shrink Cloudinary images to prevent Mobile RAM crashes
      let optimizedUrl = url;
      if (url.includes("cloudinary.com")) {
        optimizedUrl = url.replace("/upload/fl_attachment/", "/upload/")
                          .replace("/upload/", "/upload/w_1200,q_auto,f_jpg/");
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        
        // Return the base64 string AND the exact dimensions to prevent NaN errors
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.75),
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        // Fallback to original URL if the optimized one fails CORS
        const fallback = new Image();
        fallback.crossOrigin = "anonymous";
        fallback.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = fallback.naturalWidth;
          canvas.height = fallback.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(fallback, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL("image/jpeg", 0.75),
            width: fallback.naturalWidth,
            height: fallback.naturalHeight
          });
        };
        fallback.onerror = reject;
        fallback.src = url; 
      };

      img.src = optimizedUrl;
    });
  };

  const exportToPDF = async () => {
    setExporting(true);
    setProgress(0);

    try {
      const isSquare = book?.book_type === "luxury";
      const isSmall = book?.book_type === "journal";
      
      const format = isSquare ? [210, 210] : (isSmall ? "a5" : "a4");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: format,
        compress: true, 
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const theme = getThemeConfig(book?.color_scheme, book?.font_style);
      const totalPages = photos.length + 2;
      let currentPdfPage = 0;

      // ── Cover Page ──────────────────────────────────────
      setProgress(10);
      
      pdf.setFillColor(...theme.bg);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      if (book?.cover_image_url) {
        try {
          const coverImg = await loadImage(book.cover_image_url);
          // Cover ignores aspect ratio to fill the entire bleed area
          pdf.addImage(coverImg.dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
          
          pdf.setFillColor(0, 0, 0);
          pdf.setGState(new pdf.GState({ opacity: 0.5 }));
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        } catch (e) {
          console.log("Cover image failed, continuing with color bg");
        }
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFont(theme.font, "bold");
      pdf.setFontSize(32);
      pdf.text(book?.title || "My Travel Book", pdfWidth / 2, pdfHeight / 2 - 15, { align: "center" });

      pdf.setFont(theme.font, book?.font_style === "serif" ? "italic" : "normal");
      pdf.setFontSize(14);
      pdf.text(book?.cover_subtitle || "A journey to remember", pdfWidth / 2, pdfHeight / 2 + 5, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text((book?.destination || "").toUpperCase(), pdfWidth / 2, pdfHeight / 2 + 25, { align: "center" });

      currentPdfPage++;

      // ── Inner Pages ─────────────────────────────────────
      const renderPhotoPage = async (photo) => {
        pdf.addPage();
        
        pdf.setFillColor(...theme.bg);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        try {
          // ✅ Correctly load the image and its guaranteed dimensions
          const imgObj = await loadImage(photo.image_url);
          
          const margin = 16;
          const captionH = photo.caption ? 24 : 0;
          
          const maxW = pdfWidth - (margin * 2);
          const maxH = pdfHeight - captionH - (margin * 2);
          
          // Use the exact dimensions returned from our loader
          const imgRatio = imgObj.width / imgObj.height;
          const targetRatio = maxW / maxH;

          let finalW = maxW;
          let finalH = maxH;

          if (imgRatio > targetRatio) {
            finalH = maxW / imgRatio; 
          } else {
            finalW = maxH * imgRatio; 
          }

          const xOffset = margin + ((maxW - finalW) / 2);
          const yOffset = margin + ((maxH - finalH) / 2);

          // ✅ Safely add the image
          pdf.addImage(imgObj.dataUrl, "JPEG", xOffset, yOffset, finalW, finalH);

          if (photo.caption) {
            pdf.setTextColor(...theme.text);
            pdf.setFont(theme.font, book?.font_style === "serif" ? "italic" : "normal");
            pdf.setFontSize(10);
            pdf.text(photo.caption, pdfWidth / 2, pdfHeight - margin - 5, { 
              align: "center", 
              maxWidth: pdfWidth - 40 
            });
          }

          pdf.setTextColor(150, 150, 150);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.text(String(currentPdfPage), pdfWidth - margin, pdfHeight - margin + 8, { align: "right" });

        } catch (e) {
          console.log("Photo failed:", photo.image_url);
        }

        currentPdfPage++;
        setProgress(Math.floor((currentPdfPage / totalPages) * 80) + 10);
      };

      if (pages.length <= 1) {
        for (const photo of photos) {
          await renderPhotoPage(photo);
        }
      } else {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.layout === "cover") continue;

          pdf.addPage();
          pdf.setFillColor(...theme.bg);
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
          
          pdf.setTextColor(...theme.text);
          pdf.setFont(theme.font, "bold");
          pdf.setFontSize(24);
          pdf.text(page.section_title || `Section ${i}`, pdfWidth / 2, pdfHeight / 2, { align: "center" });
          
          pdf.setDrawColor(...theme.text);
          pdf.setLineWidth(0.5);
          pdf.line(pdfWidth / 2 - 20, pdfHeight / 2 + 10, pdfWidth / 2 + 20, pdfHeight / 2 + 10);

          currentPdfPage++;
          
          const sectionPhotos = photos.filter((p) => p.page_id === page.id);
          for (const photo of sectionPhotos) {
            await renderPhotoPage(photo);
          }
        }
      }

      // ── Back Cover ──────────────────────────────────────
      pdf.addPage();
      pdf.setFillColor(15, 15, 15);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("blushbook.", pdfWidth / 2, pdfHeight / 2 - 5, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(9);
      pdf.text("Printed in Nepal", pdfWidth / 2, pdfHeight / 2 + 5, { align: "center" });

      setProgress(100);

      const fileName = `${(book?.title || "blushbook").toLowerCase().replace(/\s+/g, "-")}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={exportToPDF}
        disabled={exporting}
        className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 rounded-full px-4 py-2 text-xs font-bold hover:border-gray-900 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download size={13} />
            Download PDF
          </>
        )}
      </button>

      {exporting && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-white border border-gray-100 shadow-lg p-2 rounded-xl z-50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-500">Processing</span>
            <span className="text-[10px] font-bold text-rose-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPDF;