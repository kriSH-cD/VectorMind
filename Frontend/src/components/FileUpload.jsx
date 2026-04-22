import { useState, useRef } from "react";
import { uploadFiles, ingestText } from "../services/api";

export default function FileUpload({ onIngestComplete, chatId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("file"); // "file" or "text"
  const [rawText, setRawText] = useState("");
  const [textLabel, setTextLabel] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
    if (validFiles.length !== files.length) {
      setError("Only PDF files are supported. Some files were skipped.");
    }

    if (validFiles.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Pass chatId so embeddings go to this chat's collection
      const result = await uploadFiles(validFiles, chatId);
      const filenames = result.results.map(r => r.filename);
      onIngestComplete("files", filenames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!rawText.trim()) {
      setError("Please enter some text.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const label = textLabel.trim() || "Raw Text Snippet";
      // Pass chatId so embeddings go to this chat's collection
      const result = await ingestText(rawText, label, chatId);
      onIngestComplete("text", result.filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <div className="upload-header">
        <h1 className="upload-title">VectorMind</h1>
        <p className="upload-subtitle">Select documents or paste text to begin research.</p>
      </div>

      <div className="upload-tabs">
        <button 
          className={`upload-tab ${mode === "file" ? "active" : ""}`}
          onClick={() => setMode("file")}
        >
          <span className="icon">upload_file</span> Documents
        </button>
        <button 
          className={`upload-tab ${mode === "text" ? "active" : ""}`}
          onClick={() => setMode("text")}
        >
          <span className="icon">edit_note</span> Paste Text
        </button>
      </div>

      {mode === "file" ? (
        <div 
          className="dropzone"
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <div className="dropzone__icon">
            <span className={`icon ${loading ? 'spinner' : ''}`}>
              {loading ? 'progress_activity' : 'upload_file'}
            </span>
          </div>
          
          <p className="dropzone__text">
            {loading ? 'Processing Documents...' : 'Click or Drag PDFs here'}
          </p>
          <p className="dropzone__hint">Multiple files supported (Max 10MB each)</p>
          
          <button 
            className="select-file-btn"
            disabled={loading}
          >
            Select Files
          </button>

          {error && (
            <p className="upload-error">{error}</p>
          )}
        </div>
      ) : (
        <div className="text-ingest-area">
          <input 
            type="text" 
            placeholder="Label (e.g. My Notes)" 
            className="text-ingest-label"
            value={textLabel}
            onChange={(e) => setTextLabel(e.target.value)}
            disabled={loading}
          />
          <textarea 
            className="text-ingest-textarea"
            placeholder="Paste your text here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={loading}
          />
          <button 
            className="ingest-btn"
            onClick={handleTextSubmit}
            disabled={loading || !rawText.trim()}
          >
            {loading ? <span className="icon spinner">progress_activity</span> : "Ingest Text"}
          </button>
          {error && (
            <p className="upload-error">{error}</p>
          )}
        </div>
      )}

      <p className="upload-footer">
        Supported formats: PDF, Raw Text. Your data is processed securely and privately.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
