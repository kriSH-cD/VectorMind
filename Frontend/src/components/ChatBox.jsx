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
      {messages.length === 0 && !loading ? (
        <div className="chat-empty-state">
          <h2 className="chat-empty-state__title">Start Research</h2>
          <p className="chat-empty-state__subtitle">
            Ask a precise question from the active document.
          </p>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} onOpenSource={onOpenSource} />
          ))}
          
          {loading && (
            <div className="message message--assistant">
              <div className="message-avatar">
                <span className="icon spinner loading-icon">graphic_eq</span>
              </div>
              <div className="message__bubble">
                <span className="icon spinner loading-icon" style={{ fontSize: '16px' }}>progress_activity</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} style={{ height: '150px' }} />
        </div>
      )}

      <div className="input-area-fixed">
        <p className="input-disclaimer">
          AI can make mistakes. Verify important information against the source document.
        </p>
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask a question about the document..."
            rows={1}
            className="chat-textarea"
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
      </div>
    </div>
  );
}
