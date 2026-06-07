// client/src/pages/UploadPhotos.jsx
// Photo upload page with drag and drop

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import api from "../api/axios";

const UploadPhotos = ({ bookId }) => {
  const [photos, setPhotos] = useState([]);      // uploaded photo URLs to show
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Called when user drops or selects files
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError("");

    // Upload each file one by one
    for (const file of acceptedFiles) {
      try {
        // FormData is how we send files to the backend
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("book_id", bookId || 1); // use actual bookId later

        const res = await api.post("/photos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Add new photo to our display list
        setPhotos((prev) => [...prev, res.data.photo]);
      } catch (err) {
        setError("Failed to upload one or more photos");
      }
    }

    setUploading(false);
  }, [bookId]);

  // Dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },  // only images
    multiple: true,             // allow multiple files
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Upload Your Photos</h1>
      <p className="text-gray-500 mb-8">Drag and drop your travel photos below</p>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-2xl p-16 text-center cursor-pointer transition
          ${isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400"
          }`}
      >
        <input {...getInputProps()} />
        <div className="text-6xl mb-4">📸</div>
        {isDragActive ? (
          <p className="text-blue-500 text-lg font-medium">Drop your photos here!</p>
        ) : (
          <>
            <p className="text-gray-600 text-lg font-medium">
              Drag & drop photos here
            </p>
            <p className="text-gray-400 mt-2">or click to select files</p>
          </>
        )}
      </div>

      {/* Uploading indicator */}
      {uploading && (
        <div className="text-center mt-6">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 mt-2">Uploading photos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mt-4">
          {error}
        </div>
      )}

      {/* Photo Grid — shows uploaded photos */}
      {photos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Uploaded Photos ({photos.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.image_url}
                  alt="travel"
                  className="w-full h-40 object-cover rounded-xl shadow"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPhotos;