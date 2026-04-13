/**
 * VectorMind — ChatBox Component
 * =================================
 * Main chat interface providing message list, loading indicators,
 * and user input box with Enter-to-send support.
 */

import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import { Loader, SendHorizontal, Brain } from "lucide-react";

export default function ChatBox({ messages, loading, sendMessage }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    sendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Messages List (Top) ── */}
      <div className="chat-messages">
        {messages.length === 0 && !loading ? (
          <div className="chat-empty">
            <div className="chat-empty__icon">
              <Brain size={28} />
            </div>
            <h2 className="chat-empty__title">Ask anything about your documents</h2>
            <p className="chat-empty__subtitle">
              Upload a PDF and VectorMind will find precise answers using Hybrid RAG.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))
        )}

        {/* Loading State */}
        {loading && (
          <div className="typing-indicator" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
             <Loader size={16} className="spinner" />
             <span>Waiting for response...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Box (Bottom) ── */}
      <div className="chat-input-area">
        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="chat-input__textarea"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="chat-input__send"
            title="Send Message"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
