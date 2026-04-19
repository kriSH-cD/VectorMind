import { useState, useEffect, useRef } from "react";
import Message from "./Message";

export default function ChatBox({ messages, loading, sendMessage, onOpenSource }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

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
    <div className="chat-container">
      <div className="chat-max-width">
        {messages.length === 0 && !loading ? (
          <div className="chat-empty" style={{ textAlign: 'center', marginTop: '80px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '8px' }}>Start Research</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Ask a precise question from the active document.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message key={index} message={msg} onOpenSource={onOpenSource} />
          ))
        )}

        {loading && (
          <div className="message message--assistant">
            <div className="message__bubble">
              <span className="icon spinner" style={{ color: 'var(--primary)', fontSize: '24px' }}>progress_activity</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="input-area-fixed">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask a question about the document..."
            rows={1}
            className="chat-textarea"
            style={{ 
              height: 'auto',
              minHeight: '48px',
              overflowY: 'hidden'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`send-button ${input.trim() ? 'send-button--active' : ''}`}
          >
            <span className="icon">arrow_upward</span>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          AI can make mistakes. Verify important information against the source document.
        </p>
      </div>
    </div>
  );
}
