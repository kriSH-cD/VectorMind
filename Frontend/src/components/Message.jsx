import { useState, useEffect } from "react";

export default function Message({ message, onOpenSource }) {
  const isUser = message.role === "user";
  const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : "");
  const [isTyping, setIsTyping] = useState(!isUser && message.content.length > 0);

  useEffect(() => {
    if (!isUser && message.content && message.isNew) {
      // If it's a new message, type it out
      let i = 0;
      const fullText = message.content;
      const speed = 10;
      
      setDisplayedContent("");
      setIsTyping(true);

      const interval = setInterval(() => {
        setDisplayedContent((prev) => prev + fullText.charAt(i));
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
          // Set isNew to false to avoid re-typing on re-renders
          message.isNew = false; 
        }
      }, speed);

      return () => clearInterval(interval);
    } else if (!isUser) {
      // If not a new message, show it immediately
      setDisplayedContent(message.content);
      setIsTyping(false);
    }
  }, [message.content, isUser, message.isNew]);

  const cleanContent = (text) => {
    if (!text) return "";
    return text.replace(/\(Page\s+\d+,\s+[^)]+\)/gi, "").trim();
  };

  return (
    <div className={`message message--${message.role} ${isTyping ? 'message--typing' : ''}`}>
      <div className="message-avatar">
        <span className="icon" style={{ fontSize: '18px' }}>
          {isUser ? "person" : "graphic_eq"}
        </span>
      </div>

      <div className="message__bubble">
        {cleanContent(isUser ? message.content : displayedContent)}
        
        {!isUser && message.responseTime && !isTyping && (
          <div className="message__metadata">
            <span className="icon" style={{ fontSize: '12px' }}>timer</span>
            Generated in {message.responseTime}s
          </div>
        )}

        {(() => {
          // Don't show sources for fallback/not-found answers
          const contentLower = (message.content || "").toLowerCase();
          const isFallback = 
            contentLower.includes("not found in the uploaded") ||
            contentLower.includes("not available in the provided") ||
            contentLower.includes("no documents have been uploaded") ||
            contentLower.includes("no information") ||
            contentLower.includes("does not contain") ||
            contentLower.includes("not present in");
          
          const showSources = !isUser && message.sources && message.sources.length > 0 && !isTyping && !isFallback;
          
          return showSources ? (
          <div className="message__sources">
            {message.sources.map((source, idx) => (
              <button 
                key={idx} 
                className="source-pill"
                onClick={() => onOpenSource(source)}
              >
                Page {source.page}
              </button>
            ))}
          </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}
