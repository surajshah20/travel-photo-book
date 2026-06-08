// client/src/pages/UploadPhotos.jsx

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const UploadPhotos = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
  setUploading(true);
  setError("");

  try {
    // Upload all photos at the same time (parallel)
    const uploadPromises = acceptedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("book_id", bookId);

      const res = await api.post("/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.photo;
    });

    // Wait for all uploads to finish
    const uploadedPhotos = await Promise.all(uploadPromises);
    setPhotos((prev) => [...prev, ...uploadedPhotos]);

  } catch (err) {
    console.error(err);
    setError("Failed to upload one or more photos");
  }

  setUploading(false);
}, [bookId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  // ─── Trigger AI Generation ────────────────────────────
  const handleGenerateAI = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await api.post(`/ai/generate/${bookId}`);
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
      setError("AI generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Upload Your Photos 📸
        </h1>
        <p className="text-gray-500 mb-8">
          Upload your travel photos then let AI create your book
        </p>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-2xl p-16 text-center cursor-pointer transition mb-8
            ${isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-400"
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">📸</div>
          {isDragActive ? (
            <p className="text-blue-500 text-lg font-medium">
              Drop your photos here!
            </p>
          ) : (
            <>
              <p className="text-gray-600 text-lg font-medium">
                Drag & drop photos here
              </p>
              <p className="text-gray-400 mt-2">or click to select files</p>
            </>
          )}
        </div>

        {/* Uploading Spinner */}
        {uploading && (
          <div className="text-center mb-6">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-500 mt-2">Uploading photos...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Uploaded Photos Grid */}
        {photos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Uploaded Photos ({photos.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {photos.map((photo) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.image_url}
                    alt="travel"
                    className="w-full h-40 object-cover rounded-xl shadow"
                  />
                </div>
              ))}
            </div>

            {/* AI Generate Button */}
            {!aiResult && (
              <div className="text-center">
                <button
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg"
                >
                  {generating ? (
                    <span className="flex items-center gap-3">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      AI is creating your book...
                    </span>
                  ) : (
                    "✨ Generate Book with AI"
                  )}
                </button>
                <p className="text-gray-400 text-sm mt-3">
                  AI will analyze your photos and create captions, sections, and layouts
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Result */}
        {aiResult && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-green-600 mb-6">
              ✅ Your Book is Ready!
            </h2>

            {/* Cover Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                📖 Cover Photo
              </h3>
              <div className="flex gap-6 items-center">
                <img
                  src={aiResult.cover.image_url}
                  alt="cover"
                  className="w-48 h-32 object-cover rounded-xl shadow-md"
                />
                <div>
                  <p className="text-gray-500 text-sm">Subtitle</p>
                  <p className="text-gray-800 font-medium text-lg">
                    {aiResult.cover.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                📚 Book Sections
              </h3>
              <div className="space-y-3">
                {aiResult.sections.map((section, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-gray-50 px-4 py-3 rounded-xl"
                  >
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{section.title}</p>
                      <p className="text-sm text-gray-500">
                        {section.photo_indices.length} photos · {section.layout} layout
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Captions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                💬 AI Generated Captions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiResult.captions.map((caption, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                    <img
                      src={aiResult.photos[i]?.image_url}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <p className="text-gray-600 text-sm">{caption}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Go to Editor Button */}
            <div className="text-center">
              <button
                onClick={() => navigate(`/editor/${bookId}`)}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg"
              >
                Open Book Editor →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPhotos;