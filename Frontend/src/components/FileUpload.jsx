import { useState, useRef } from "react";
import { uploadFile } from "../services/api";

export default function FileUpload({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // Updated to 50MB per design
      setError("File exceeds 50MB limit.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await uploadFile(file);
      onUploadComplete(result.filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="upload-card">
      <div className="text-center" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Upload a Document</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Start a conversation to extract insights.</p>
      </div>

      <div 
        className="dropzone"
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <div className="dropzone__icon">
          <span className="icon" style={{ fontSize: '24px' }}>
            {loading ? 'progress_activity' : 'upload_file'}
          </span>
        </div>
        
        <p style={{ fontWeight: '600', fontSize: '16px' }}>
          {loading ? 'Processing Upload...' : 'Drag & drop PDF here'}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Limit 50MB per file</p>
        
        <button 
          className="sidebar-item" 
          style={{ 
            width: '100%', 
            maxWidth: '200px', 
            justifyContent: 'center', 
            background: 'var(--primary)', 
            color: 'white',
            fontWeight: '500' 
          }}
          disabled={loading}
        >
          Select File
        </button>

        {error && (
          <p style={{ marginTop: '12px', color: '#dc2626', fontSize: '13px' }}>{error}</p>
        )}
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
        Supported formats: PDF. By uploading, you agree to our terms of service and privacy policy.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
    </div>
  );
}
