/**
 * VectorMind — SourceList Component
 * ====================================
 * Displays an interactable, collapsible source citation block beneath an assistant message.
 */

import { useState } from "react";
import { BookOpen, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function SourceList({ sources }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  // Sort sources by relevance_score (descending)
  const sortedSources = [...sources].sort(
    (a, b) => (b.relevance_score || 0) - (a.relevance_score || 0)
  );

  const truncate = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div style={{ 
      marginTop: "8px", 
      border: "1px solid var(--border-subtle)", 
      borderRadius: "8px", 
      backgroundColor: "var(--bg-secondary)", 
      overflow: "hidden",
      width: "fit-content",
      minWidth: "250px",
      maxWidth: "100%"
    }}>
      {/* Collapsible Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "8px 12px", 
          background: "transparent", 
          border: "none", 
          cursor: "pointer", 
          color: "var(--text-secondary)", 
          fontSize: "13px", 
          fontWeight: "600" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={14} />
          Sources ({sources.length})
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div style={{ 
          padding: "12px", 
          borderTop: "1px solid var(--border-subtle)", 
          display: "flex", 
          flexDirection: "column", 
          gap: "12px",
          backgroundColor: "var(--bg-primary)"
        }}>
          {sortedSources.map((source, index) => (
            <div key={index} style={{ fontSize: "13px", lineHeight: "1.5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontWeight: "500", marginBottom: "4px" }}>
                <FileText size={12} />
                Page {source.page} ({source.file})
              </div>
              <div style={{ 
                color: "var(--text-secondary)", 
                fontStyle: "italic", 
                paddingLeft: "18px", 
                borderLeft: "2px solid var(--border-subtle)" 
              }}>
                "{truncate(source.text)}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
