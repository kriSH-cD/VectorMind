import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import FileUpload from "../components/FileUpload";
import { useChatSessions } from "../hooks/useChatSessions";

export default function Home() {
  const {
    sessions,
    activeSessionId,
    activeSession,
    loading,
    createNewChat,
    switchSession,
    renameSession,
    deleteSession,
    sendMessage,
    attachFileToSession,
  } = useChatSessions();

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "var(--bg-primary)" }}>
      {/* ── LEFT SIDEBAR ── */}
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={createNewChat}
        onSelectChat={switchSession}
        onRenameChat={renameSession}
        onDeleteChat={deleteSession}
      />

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Simple top header for main area */}
        <header style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h1 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
            {activeSession?.title || "New Chat"}
          </h1>
        </header>

        {/* Chat Interface Container */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "24px" }}>
          {/* We wrap ChatBox in a flex container so it scales correctly like before */}
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            minHeight: 0, 
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            overflow: "hidden",
            padding: "16px 0 0 0" // padding offset for the file uploader
          }}>
            <div style={{ padding: "0 16px" }}>
              <FileUpload
                selectedFile={activeSession?.selectedFile || null}
                onUploadComplete={attachFileToSession}
              />
            </div>
            
            <ChatBox
              messages={activeSession?.messages || []}
              loading={loading}
              sendMessage={sendMessage}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
