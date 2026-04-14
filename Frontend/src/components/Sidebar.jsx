import { useState, useMemo } from "react";

export default function Sidebar({ sessions, activeSessionId, onNewChat, onSelectChat, onRenameChat, onDeleteChat }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessions, searchQuery]);

  const groups = useMemo(() => {
    const today = [];
    const previous = [];
    const now = new Date();
    
    filteredSessions.forEach(session => {
      const date = new Date(session.updatedAt || Date.now());
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      if (diff < 1) today.push(session);
      else previous.push(session);
    });

    return { today, previous };
  }, [filteredSessions]);

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
      <div className="sidebar__new-chat">
        <button 
          onClick={onNewChat}
          className="sidebar-item"
          style={{ 
            width: "100%", 
            justifyContent: "center", 
            background: "var(--bg-surface)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
            fontWeight: "500"
          }}
        >
          <span className="icon" style={{ fontSize: '18px', marginRight: '8px' }}>add</span>
          New Chat
        </button>
      </div>

      <div className="sidebar__search">
        <div style={{ position: 'relative' }}>
          <span className="icon" style={{ 
            position: 'absolute', 
            left: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: 'var(--text-muted)'
          }}>search</span>
          <input 
            type="text" 
            placeholder="Search chats..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar__history">
        {groups.today.length > 0 && (
          <>
            <div className="history-group-label">Today</div>
            {groups.today.map(s => renderItem(s))}
          </>
        )}

        {groups.previous.length > 0 && (
          <>
            <div className="history-group-label">Previous 7 Days</div>
            {groups.previous.map(s => renderItem(s))}
          </>
        )}

        {filteredSessions.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
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
        onClick={() => !isEditing && onSelectChat(session.id)}
        className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
        style={{ position: 'relative' }}
      >
        <span className="icon" style={{ 
          fontSize: '18px', 
          color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
          flexShrink: 0 
        }}>description</span>
        
        {isEditing ? (
          <input 
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitEdit(e, session.id);
              if (e.key === "Escape") setEditingId(null);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "14px",
              color: "inherit"
            }}
          />
        ) : (
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.title}
          </span>
        )}

        <div className="item-actions" style={{ display: 'flex', gap: '4px' }}>
          {!isEditing && (
            <button 
              onClick={(e) => startEdit(e, session)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="icon" style={{ fontSize: '16px' }}>more_horiz</span>
            </button>
          )}
        </div>
      </div>
    );
  }
}
