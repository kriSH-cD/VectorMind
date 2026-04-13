import { useState } from "react";
import { Plus, MessageSquare, Edit2, Trash2, Check, X } from "lucide-react";

export default function Sidebar({ sessions, activeSessionId, onNewChat, onSelectChat, onRenameChat, onDeleteChat }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

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

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div style={{
      width: "260px",
      backgroundColor: "var(--bg-secondary)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "16px"
    }}>
      {/* New Chat Button */}
      <button 
        onClick={onNewChat}
        className="button button--primary"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "24px"
        }}
      >
        <Plus size={16} />
        New Chat
      </button>

      {/* Chat History List */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase" }}>
          Recent Chats
        </div>

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const isEditing = session.id === editingId;

          return (
            <div
              key={session.id}
              onClick={() => { if (!isEditing) onSelectChat(session.id); }}
              className="chat-sidebar-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: isActive ? "var(--accent-primary)" : "transparent",
                color: isActive ? "#fff" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, overflow: "hidden" }}>
                <MessageSquare size={16} style={{ flexShrink: 0 }} />
                
                {isEditing ? (
                  <input 
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitEdit(e, session.id);
                      if (e.key === "Escape") cancelEdit(e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: isActive ? "#fff" : "var(--text-primary)",
                      outline: "none",
                      borderRadius: "4px",
                      padding: "2px 4px",
                      fontSize: "14px"
                    }}
                  />
                ) : (
                  <span style={{ 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis",
                    fontSize: "14px",
                    fontWeight: isActive ? 500 : 400
                  }}>
                    {session.title}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="chat-actions" style={{ display: "flex", gap: "4px", opacity: isEditing ? 1 : (isActive ? 0.8 : 0) }}>
                {isEditing ? (
                  <>
                    <button onClick={(e) => submitEdit(e, session.id)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}><Check size={14}/></button>
                    <button onClick={(e) => cancelEdit(e)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}><X size={14}/></button>
                  </>
                ) : (
                  <>
                    {/* Render edit and trash on hover. In CSS, we usually control visibility via parent hover, but for inline styles we rely on isActive or standard opacity rules. */}
                    <button onClick={(e) => startEdit(e, session)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}><Trash2 size={14}/></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
