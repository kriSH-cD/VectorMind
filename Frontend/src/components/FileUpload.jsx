/**
 * VectorMind — FileUpload Component
 * ====================================
 * Drag-and-drop PDF upload zone with document selector.
 *
 * Features:
 *   - Drag & drop support with visual feedback
 *   - Click-to-browse fallback
 *   - Upload progress/status indicators
 *   - List of uploaded documents with active selection
 */

import { useState, useRef } from "react";
import { Paperclip, Loader, Check, FileText } from "lucide-react";
import { uploadFile } from "../services/api";

export default function FileUpload({ selectedFile, onUploadComplete }) {
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

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
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

  // If a file is successfully mapped to this session, show it permanently.
  if (selectedFile) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "rgba(0, 212, 170, 0.1)", borderRadius: "8px", color: "var(--accent-primary)", fontSize: "14px", fontWeight: "500", width: "fit-content" }}>
        <Check size={14} />
        <FileText size={14} />
        Attached: {selectedFile}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
      <button
        onClick={() => !loading && fileInputRef.current?.click()}
        disabled={loading}
        className="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "transparent",
          border: "1px dashed var(--border-accent)",
          color: "var(--accent-primary)",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? <Loader size={16} className="spinner" /> : <Paperclip size={16} />}
        {loading ? "Processing Upload..." : "Attach PDF"}
      </button>

      {error && <span style={{ color: "var(--danger)", fontSize: "12px" }}>{error}</span>}

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
