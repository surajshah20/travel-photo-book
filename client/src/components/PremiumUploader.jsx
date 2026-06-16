// client/src/components/PremiumUploader.jsx

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import api from '../api/axios';

const PremiumUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    // 1. Instant Frontend Feedback (The UX Shield)
    if (fileRejections.length > 0) {
      const reason = fileRejections[0].errors[0].message;
      setError(`Cannot upload: ${reason}`);
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // 2. Clear old errors and start upload
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // 3. Send to the Backend (The Security Shield)
      const res = await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUploadSuccess(res.data.imageUrl);
      
    } catch (err) {
      // Catch backend security rejections gracefully
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit frontend match
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        {...getRootProps()} 
        className={`
          relative overflow-hidden flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer
          ${isDragReject ? 'border-red-500 bg-red-50' : 
            isDragActive ? 'border-gray-900 bg-gray-50 scale-[1.02]' : 
            'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        
        {/* Animated Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in">
            <span className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold text-gray-900">Optimizing & Uploading...</p>
          </div>
        )}

        {/* Normal State */}
        <div className={`flex flex-col items-center justify-center p-6 text-center transition-opacity ${uploading ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragReject ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-900'}`}>
            {isDragReject ? <AlertCircle size={28} /> : <UploadCloud size={28} />}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-1 font-display">
            {isDragReject ? "File type not supported" : 
             isDragActive ? "Drop your photo here" : 
             "Upload Custom Cover"}
          </h3>
          
          <p className="text-sm font-medium text-gray-500 max-w-[250px]">
            Drag and drop your premium photo, or click to browse.
          </p>
          
          <div className="mt-6 flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ImageIcon size={14} /> JPG, PNG, WEBP</span>
            <span>•</span>
            <span>UP TO 10MB</span>
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium leading-snug flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PremiumUploader;