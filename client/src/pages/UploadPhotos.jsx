// client/src/pages/UploadPhotos.jsx
// BlushBook — Upload & AI Generation (design system aligned)

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload, X, Wand2, CheckCircle,
  Images, ArrowRight, Plus, AlertCircle
} from "lucide-react";
import api from "../api/axios";
import AppNavbar from "../design-system/AppNavbar";
import Logo from "../design-system/Logo";
import { C, S, authPageStyles } from "../design-system/index";
import imageCompression from 'browser-image-compression';

// ─── AI Steps (perceived progress) ───────────────────────
const AI_STEPS = [
  { label: "Analysing your photos", pct: 15 },
  { label: "Selecting the best cover", pct: 32 },
  { label: "Organising into sections", pct: 54 },
  { label: "Writing captions", pct: 72 },
  { label: "Applying your template", pct: 88 },
  { label: "Finishing your book", pct: 97 },
];

const UploadPhotos = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  // ─── Upload ────────────────────────────────────────────
  // ─── Upload ────────────────────────────────────────────
  // ─── Upload ────────────────────────────────────────────
  const onDrop = useCallback(async (files) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    setUploadPct(0);

    // 1. CREATE INSTANT LOCAL PREVIEWS (The Smoke & Mirrors)
    const tempPhotos = files.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      image_url: URL.createObjectURL(file), // Instantly creates a local browser URL
      isUploading: true, // Custom flag so we know it's not finished
      caption: ""
    }));

    // 2. SHOW THEM ON SCREEN IMMEDIATELY
    setPhotos(prev => [...prev, ...tempPhotos]);

    try {
      let completedCount = 0;
      const compressionOptions = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2048,
        useWebWorker: true
      };

      // 3. COMPRESS & UPLOAD IN THE BACKGROUND
      const uploadPromises = files.map(async (file, index) => {
        const compressedFile = await imageCompression(file, compressionOptions);
        const form = new FormData();
        form.append("photo", compressedFile, file.name);
        form.append("book_id", bookId);

        const res = await api.post("/photos/upload", form, { timeout: 0 });

        completedCount++;
        setUploadPct(Math.round((completedCount / files.length) * 100));

        // 4. SWAP THE TEMP PHOTO WITH THE REAL SAVED PHOTO
        setPhotos(prev => prev.map(p =>
          p.id === tempPhotos[index].id ? res.data.photo : p
        ));

        return res.data.photo;
      });

      await Promise.all(uploadPromises);

    } catch (err) {
      console.error(err);
      setError("Some uploads failed. Please check your connection.");
      // Remove the temp photos that failed to upload
      setPhotos(prev => prev.filter(p => !p.isUploading));
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }, [bookId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "image/jpeg": ['.jpg', '.jpeg'],
      "image/png": ['.png'],
      "image/webp": ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
    multiple: true,
    disabled: uploading || generating,
  });

  // ─── AI Generation ─────────────────────────────────────
  const handleGenerateAI = async () => {
    setGenerating(true);
    setError("");
    setGenStep(0);

    // Simulate progress steps (UX — actual API runs in background)
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < AI_STEPS.length - 1) {
        setGenStep(step);
      } else {
        clearInterval(interval);
      }
    }, 650);

    try {
      const res = await api.post(`/ai/generate/${bookId}`);
      clearInterval(interval);
      setGenStep(AI_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 400)); // brief pause on last step
      setAiResult(res.data);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setError("AI generation failed. Please try again or build manually.");
    } finally {
      setGenerating(false);
    }
  };

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  const currentStep = AI_STEPS[genStep] || AI_STEPS[0];

  return (
    <>
      <style>{authPageStyles}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${C.bgSoft}; }
      `}</style>

      <AppNavbar
        backTo="/dashboard"
        backLabel="Dashboard"
        title="Upload Photos"
        actions={
          photos.length > 0 && !aiResult && !generating ? (
            <button
              onClick={() => navigate(`/editor/${bookId}`)}
              style={{
                fontSize: 12, fontWeight: 600, color: C.muted,
                background: "none", border: `1px solid ${C.line}`,
                borderRadius: 100, padding: "6px 14px", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.ink; e.currentTarget.style.borderColor = C.ink; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.line; }}
            >
              Skip to Editor
            </button>
          ) : null
        }
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 56px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* ── Header ──────────────────────────────────── */}
        {!aiResult && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 26, fontWeight: 800, color: C.ink,
              margin: "0 0 6px", letterSpacing: "-0.03em",
            }}>
              Upload your photos
            </h1>
            <p style={{ fontSize: 14, color: C.muted, margin: 0, fontWeight: 400 }}>
              The more you add, the richer your book will look. 10–50 photos is ideal.
            </p>
          </div>
        )}

        {/* ── Tips (empty state only) ──────────────────── */}
        {photos.length === 0 && !generating && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12, marginBottom: 20,
          }} className="tips-grid">
            {[
              { icon: <Images size={16} color={C.rose} />, text: "10–50 photos for best results" },
              { icon: <CheckCircle size={16} color="#16A34A" />, text: "JPG, PNG, WEBP supported" },
              { icon: <Wand2 size={16} color="#7C3AED" />, text: "AI organises everything for you" },
            ].map((tip, i) => (
              <div key={i} style={{
                background: "#fff", border: `1px solid ${C.line}`,
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, background: C.bgSoft,
                  borderRadius: 10, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  {tip.icon}
                </div>
                <p style={{ fontSize: 11.5, color: C.muted, margin: 0, lineHeight: 1.45 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Dropzone ────────────────────────────────── */}
        {!aiResult && !generating && (
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? C.rose : C.line}`,
              borderRadius: 20,
              padding: "52px 32px",
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              background: isDragActive ? C.roseSoft : "#fff",
              transition: "border-color 0.18s, background 0.18s",
              marginBottom: 20,
            }}
            onMouseEnter={e => { if (!isDragActive) e.currentTarget.style.borderColor = C.roseMid; }}
            onMouseLeave={e => { if (!isDragActive) e.currentTarget.style.borderColor = C.line; }}
          >
            <input {...getInputProps()} />
            <div style={{
              width: 56, height: 56, background: C.roseSoft,
              borderRadius: 16, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px",
            }}>
              <Upload size={26} color={C.rose} />
            </div>
            {isDragActive ? (
              <p style={{ fontSize: 16, fontWeight: 700, color: C.rose, margin: 0 }}>
                Drop your photos here
              </p>
            ) : (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 6px" }}>
                  Drag & drop photos here
                </p>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 18px", fontWeight: 400 }}>
                  or click to browse your device
                </p>
                <span style={{
                  display: "inline-block",
                  background: C.ink, color: "#fff",
                  borderRadius: 100, padding: "9px 22px",
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Browse Photos
                </span>
              </>
            )}
          </div>
        )}

        {/* ── Upload Progress ──────────────────────────── */}
        {uploading && (
          <div style={{
            background: "#fff", border: `1px solid ${C.line}`,
            borderRadius: 16, padding: "18px 20px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
                Uploading photos...
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.rose }}>
                {uploadPct}%
              </span>
            </div>
            <div style={{ background: C.line, borderRadius: 100, height: 4 }}>
              <div style={{
                background: C.rose, height: 4, borderRadius: 100,
                width: `${uploadPct}%`, transition: "width 0.3s",
              }} />
            </div>
          </div>
        )}

        {/* ── Error ───────────────────────────────────── */}
        {error && (
          <div className="bb-server-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* ── Photo Grid ──────────────────────────────── */}
        {photos.length > 0 && !aiResult && !generating && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 12,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>
                {photos.length} photo{photos.length !== 1 ? "s" : ""} ready
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8, marginBottom: 16,
            }} className="photo-grid">
              {photos.map(photo => (
                <div key={photo.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden" }}
                  onMouseEnter={e => { if (!photo.isUploading) e.currentTarget.querySelector(".del-btn").style.opacity = "1" }}
                  onMouseLeave={e => { if (!photo.isUploading) e.currentTarget.querySelector(".del-btn").style.opacity = "0" }}
                >
                  <img
                    src={photo.image_url}
                    alt=""
                    style={{
                      width: "100%", height: "100%", objectFit: "cover", display: "block",
                      opacity: photo.isUploading ? 0.5 : 1, // Dim the image while uploading
                      filter: photo.isUploading ? "blur(2px)" : "none", // Add a nice blur effect
                      transition: "opacity 0.3s, filter 0.3s"
                    }}
                  />

                  {/* Show spinner if uploading, otherwise show delete button */}
                  {photo.isUploading ? (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <span style={{
                        width: 24, height: 24,
                        border: "3px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite"
                      }} />
                    </div>
                  ) : (
                    <button
                      className="del-btn"
                      onClick={() => removePhoto(photo.id)}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        width: 22, height: 22,
                        background: "rgba(0,0,0,0.55)", border: "none",
                        borderRadius: "50%", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: "opacity 0.15s",
                      }}
                    >
                      <X size={11} color="#fff" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add more */}
              <div
                {...getRootProps()}
                style={{
                  aspectRatio: "1", borderRadius: 12,
                  border: `2px dashed ${C.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "border-color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.rose}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.line}
              >
                <input {...getInputProps()} />
                <Plus size={18} color={C.subtle} />
              </div>
            </div>

            {/* Generate Panel */}
            <div style={{
              background: "#fff", border: `1px solid ${C.line}`,
              borderRadius: 20, padding: "28px",
              textAlign: "center",
            }}>
              <div style={{
                width: 52, height: 52, background: C.ink,
                borderRadius: 15, display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 16px",
              }}>
                <Wand2 size={24} color="#fff" />
              </div>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 18, fontWeight: 800, color: C.ink,
                margin: "0 0 7px", letterSpacing: "-0.02em",
              }}>
                Ready to build your book?
              </h3>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 22px", lineHeight: 1.6, fontWeight: 400, maxWidth: 360, marginInline: "auto" }}>
                AI will analyse your {photos.length} photos, create sections, write captions, and produce a complete first draft.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleGenerateAI}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: C.ink, color: "#fff",
                    border: "none", borderRadius: 100,
                    padding: "12px 26px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "background 0.18s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rose}
                  onMouseLeave={e => e.currentTarget.style.background = C.ink}
                >
                  <Wand2 size={15} /> Generate with AI
                </button>
                <button
                  onClick={() => navigate(`/editor/${bookId}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "none", color: C.muted,
                    border: `1.5px solid ${C.line}`, borderRadius: 100,
                    padding: "12px 22px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.muted; }}
                >
                  Build manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI Generating State ──────────────────────── */}
        {generating && (
          <div style={{
            background: "#fff", border: `1px solid ${C.line}`,
            borderRadius: 20, padding: "48px 32px",
            textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, background: C.ink,
              borderRadius: 16, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 20px",
            }}>
              <Wand2 size={26} color="#fff" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 18, fontWeight: 800, color: C.ink,
              margin: "0 0 6px", letterSpacing: "-0.02em",
            }}>
              Creating your book...
            </h3>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 28px", fontWeight: 400 }}>
              {currentStep.label}
            </p>

            {/* Progress bar */}
            <div style={{
              background: C.line, borderRadius: 100,
              height: 6, maxWidth: 320, margin: "0 auto 10px",
            }}>
              <div style={{
                background: C.rose, height: 6, borderRadius: 100,
                width: `${currentStep.pct}%`,
                transition: "width 0.65s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
            <p style={{ fontSize: 11.5, color: C.subtle, margin: 0 }}>
              {currentStep.pct}% complete
            </p>
          </div>
        )}

        {/* ── AI Result ───────────────────────────────── */}
        {aiResult && (
          <div>
            {/* Success */}
            <div style={{
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: 18, padding: "22px 24px",
              display: "flex", alignItems: "center", gap: 14,
              marginBottom: 20,
            }}>
              <div style={{
                width: 42, height: 42, background: "#DCFCE7",
                borderRadius: 12, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <CheckCircle size={22} color="#16A34A" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#14532D", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
                  Your book is ready!
                </p>
                <p style={{ fontSize: 12.5, color: "#16A34A", margin: 0, fontWeight: 400 }}>
                  {aiResult.sections.length} section{aiResult.sections.length !== 1 ? "s" : ""} created from {photos.length} photos
                </p>
              </div>
            </div>

            {/* Cover preview */}
            <div style={{
              background: "#fff", border: `1px solid ${C.line}`,
              borderRadius: 18, overflow: "hidden", marginBottom: 14,
            }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>Cover</p>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                {aiResult.cover.image_url && (
                  <img
                    src={aiResult.cover.image_url}
                    alt="cover"
                    style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 10 }}
                  />
                )}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 3px" }}>
                    {aiResult.cover.subtitle}
                  </p>
                  <p style={{ fontSize: 11.5, color: C.muted, margin: 0 }}>
                    {aiResult.color_scheme} · {aiResult.font_style} font
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div style={{
              background: "#fff", border: `1px solid ${C.line}`,
              borderRadius: 18, overflow: "hidden", marginBottom: 22,
            }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>
                  Sections — {aiResult.sections.length} created
                </p>
              </div>
              {aiResult.sections.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px",
                  borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
                }}>
                  <div style={{
                    width: 28, height: 28, background: C.roseSoft,
                    borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: C.rose, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: C.subtle, margin: "1px 0 0" }}>
                      {s.photos.length} photo{s.photos.length !== 1 ? "s" : ""} · {s.layout} layout
                    </p>
                  </div>
                  {/* Photo thumbs */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {s.photos.slice(0, 3).map((p, pi) => (
                      <img key={pi} src={p.image_url} alt="" style={{ width: 32, height: 28, objectFit: "cover", borderRadius: 6 }} />
                    ))}
                    {s.photos.length > 3 && (
                      <div style={{
                        width: 32, height: 28, background: C.bgSoft,
                        borderRadius: 6, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 10, color: C.subtle, fontWeight: 700,
                      }}>
                        +{s.photos.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate(`/editor/${bookId}`)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                background: C.ink, color: "#fff",
                border: "none", borderRadius: 16,
                padding: "16px", fontSize: 15, fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "-0.01em",
                transition: "background 0.18s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.rose}
              onMouseLeave={e => e.currentTarget.style.background = C.ink}
            >
              Open Book Editor <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 520px) {
          .tips-grid { grid-template-columns: 1fr !important; }
          .photo-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </>
  );
};

export default UploadPhotos;