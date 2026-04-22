import { useState, useMemo } from "react";

export default function Sidebar({ sessions, activeSessionId, onNewChat, onSelectChat, onRenameChat, onDeleteChat }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const groups = useMemo(() => {
    const today = [];
    const previous = [];
    const now = new Date();
    
    sessions.forEach(session => {
      const date = new Date(session.updatedAt || Date.now());
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      if (diff < 1) today.push(session);
      else previous.push(session);
    });

    return { today, previous };
  }, [sessions]);

  const startEdit = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const submitEdit = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle);
    }
    setEditingId(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-text">VectorMind</div>
      </div>

      <button className="sidebar-new-btn" onClick={onNewChat}>
        <span className="icon">add</span>
        <span>New Chat</span>
      </button>

      <div className="sidebar__history">
        {groups.today.length > 0 && (
          <>
            <div className="history-group-label">Today</div>
            {groups.today.map(s => renderItem(s))}
          </>
        )}

        {groups.previous.length > 0 && (
          <>
            <div className="history-group-label">Previous</div>
            {groups.previous.map(s => renderItem(s))}
          </>
        )}

        {sessions.length === 0 && (
          <div className="sidebar-empty">
            No chats found
          </div>
        )}
      </div>

    </aside>
  );

  function renderItem(session) {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;

    return (
      <div
        key={session.id}
        onClick={() => {
          if (isActive) {
            setEditingId(session.id);
            setEditTitle(session.title);
          } else {
            onSelectChat(session.id);
          }
        }}
        className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
      >
        <span className="icon sidebar-item__icon">
          {isActive ? "chat_bubble" : "description"}
        </span>
        
        {isEditing ? (
          <input 
            autoFocus
            className="sidebar-item__input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={(e) => submitEdit(e, session.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitEdit(e, session.id);
              if (e.key === "Escape") setEditingId(null);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="sidebar-item__title">
            {session.title}
          </span>
        )}

        {!isEditing && (
          <button 
            className="sidebar-item__action"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(session.id);
            }}
          >
            <span className="icon" style={{ fontSize: '16px' }}>delete</span>
          </button>
        )}
      </div>
    );
  }
}
