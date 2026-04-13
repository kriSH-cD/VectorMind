/**
 * VectorMind — Message Component
 * =================================
 * Renders a single chat message (user or assistant).
 * Assistant messages include source citations if available.
 */

import { User, Brain } from "lucide-react";
import SourceList from "./SourceList";

export default function Message({ message }) {
  const isUser = message.role === "user";

  const cleanContent = (text) => {
    if (!text) return "";
    // Remove inline citations (e.g. "(Page 5, document.pdf)") so sources
    // aren't visually mixed into the main text body.
    return text.replace(/\(Page\s+\d+,\s+[^)]+\)/gi, "").trim();
  };

  return (
    <div className={`message message--${message.role}`}>
      <div className="message__avatar">
        {isUser ? <User size={16} /> : <Brain size={16} />}
      </div>

      <div className="message__content" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="message__text" style={{ whiteSpace: "pre-wrap" }}>
          {cleanContent(message.content)}
        </div>

        {/* Show sources only for assistant messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} />
        )}
      </div>
    </div>
  );
}
