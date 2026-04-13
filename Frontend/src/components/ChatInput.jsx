/**
 * VectorMind — ChatInput Component
 * ====================================
 * Text input with send button for submitting queries.
 * Supports Enter to send, Shift+Enter for new line.
 */

import { useState, useRef } from "react";
import { SendHorizontal } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput("");

    // Reset textarea height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    // Enter sends the message; Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea as user types
  const handleInput = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input">
        <textarea
          ref={textareaRef}
          className="chat-input__textarea"
          placeholder="Ask a question about your documents..."
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          className="chat-input__send"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          title="Send message"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
      <p className="chat-input__hint">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
}
