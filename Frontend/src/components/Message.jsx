export default function Message({ message, onOpenSource }) {
  const isUser = message.role === "user";

  const cleanContent = (text) => {
    if (!text) return "";
    return text.replace(/\(Page\s+\d+,\s+[^)]+\)/gi, "").trim();
  };

  return (
    <div className={`message message--${message.role}`}>
      <div className="message__bubble">
        {cleanContent(message.content)}
      </div>

      {!isUser && message.sources && message.sources.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {message.sources.map((source, idx) => (
            <button 
              key={idx} 
              className="source-pill"
              onClick={() => onOpenSource(source)}
            >
              <span className="icon" style={{ fontSize: '14px' }}>find_in_page</span>
              Page {source.page}: {source.file?.split('/').pop() || 'Context'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
