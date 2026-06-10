// client/src/pages/UploadPhotos.jsx
// Blushbook — Professional Photo Upload Page

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen, Upload, X, Wand2,
  CheckCircle, Image, ArrowRight
} from "lucide-react";
import api from "../api/axios";

const UploadPhotos = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const generatingSteps = [
    "Analyzing your photos...",
    "Selecting the best cover...",
    "Creating sections...",
    "Writing captions...",
    "Building your book...",
  ];

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("book_id", bookId);

        const res = await api.post("/photos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setUploadProgress(Math.round(((index + 1) / acceptedFiles.length) * 100));
        return res.data.photo;
      });

      const uploaded = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
      setError("Failed to upload one or more photos. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [bookId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removePhoto = (photoId) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    setError("");

    // Animate through steps
    const interval = setInterval(() => {
      setGeneratingStep((prev) => {
        if (prev >= generatingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    try {
      const res = await api.post(`/ai/generate/${bookId}`);
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
      setError("AI generation failed. Please try again.");
    } finally {
      clearInterval(interval);
      setGenerating(false);
      setGeneratingStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            blush<span className="text-rose-500">book</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded
          </span>
          {photos.length > 0 && !aiResult && (
            <button
              onClick={() => navigate(`/editor/${bookId}`)}
              className="text-gray-500 hover:text-gray-700 text-sm border border-gray-200 px-4 py-2 rounded-full transition"
            >
              Skip to Editor
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Upload your photos
          </h1>
          <p className="text-gray-400 text-sm">
            Upload your travel photos — the more you add, the better your book will look
          </p>
        </div>

        {/* Upload Tips */}
        {photos.length === 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Image className="w-4 h-4 text-rose-500" />, text: "Upload 10-50 photos for best results" },
              { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: "JPG, PNG and WEBP formats supported" },
              { icon: <Wand2 className="w-4 h-4 text-purple-500" />, text: "AI will organize them automatically" },
            ].map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card">
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {tip.icon}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Drop Zone */}
        {!aiResult && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition mb-8
              ${isDragActive
                ? "border-rose-400 bg-rose-50"
                : "border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/30"
              }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-rose-400" />
            </div>
            {isDragActive ? (
              <p className="text-rose-500 text-lg font-semibold">
                Drop your photos here
              </p>
            ) : (
              <>
                <p className="text-gray-700 font-semibold text-lg mb-1">
                  Drag and drop your photos here
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  or click to browse your files
                </p>
                <span className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-rose-500 transition">
                  Browse Photos
                </span>
              </>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Uploading photos...
              </span>
              <span className="text-sm text-rose-500 font-semibold">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 && !aiResult && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">
                Uploaded Photos
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({photos.length})
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square">
                  <img
                    src={photo.image_url}
                    alt="travel"
                    className="w-full h-full object-cover rounded-xl shadow-card"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add more */}
              <div
                {...getRootProps()}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition"
              >
                <input {...getInputProps()} />
                <Upload className="w-5 h-5 text-gray-300" />
              </div>
            </div>

            {/* AI Generate Button */}
            <div className="bg-white rounded-3xl p-8 shadow-card text-center">
              <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Ready to create your book?
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                AI will analyze your {photos.length} photos, organize them
                into sections, write captions, and create your complete book.
              </p>

              {generating ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-700 font-medium text-sm">
                      {generatingSteps[generatingStep]}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-xs mx-auto">
                    <div
                      className="bg-gray-900 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${((generatingStep + 1) / generatingSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleGenerateAI}
                    className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-rose-500 transition"
                  >
                    Generate with AI
                  </button>
                  <button
                    onClick={() => navigate(`/editor/${bookId}`)}
                    className="border border-gray-200 text-gray-600 px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition"
                  >
                    Build Manually
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Result */}
        {aiResult && (
          <div className="space-y-6">
            {/* Success header */}
            <div className="bg-white rounded-3xl p-8 shadow-card text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h3
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your book is ready!
              </h3>
              <p className="text-gray-400 text-sm">
                AI has organized your photos into a beautiful travel book
              </p>
            </div>

            {/* Cover preview */}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h4 className="font-bold text-gray-800">Cover Photo</h4>
              </div>
              <div className="p-6 flex items-center gap-6">
                <img
                  src={aiResult.cover.image_url}
                  alt="cover"
                  className="w-32 h-24 object-cover rounded-2xl shadow-card"
                />
                <div>
                  <p className="text-gray-400 text-xs mb-1">Subtitle</p>
                  <p className="font-semibold text-gray-800">
                    {aiResult.cover.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h4 className="font-bold text-gray-800">
                  Book Sections
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({aiResult.sections.length} sections)
                  </span>
                </h4>
              </div>
              <div className="p-6 space-y-3">
                {aiResult.sections.map((section, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3"
                  >
                    <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {section.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {section.photo_indices.length} photos · {section.layout} layout
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Captions */}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h4 className="font-bold text-gray-800">AI Captions</h4>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiResult.captions.slice(0, 6).map((caption, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-2xl">
                    {aiResult.photos[i]?.image_url && (
                      <img
                        src={aiResult.photos[i].image_url}
                        alt=""
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                      />
                    )}
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate(`/editor/${bookId}`)}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-base hover:bg-rose-500 transition flex items-center justify-center gap-2"
            >
              Open Book Editor
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPhotos;