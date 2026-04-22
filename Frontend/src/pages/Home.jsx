import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import FileUpload from "../components/FileUpload";
import SourceDrawer from "../components/SourceDrawer";
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
    handleIngestComplete,
  } = useChatSessions();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleOpenSource = (source) => {
    setSelectedSource(source);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* ── SIDEBAR ── */}
      <div className={`sidebar ${!isSidebarOpen ? 'sidebar--collapsed' : ''}`}>
        <Sidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={createNewChat}
          onSelectChat={switchSession}
          onRenameChat={renameSession}
          onDeleteChat={deleteSession}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="main-layout">
        <header className="chat-header">
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="icon">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
          </button>
          <h1 className="chat-header__title">
            {activeSession?.selectedFile || "New Conversation"}
          </h1>
        </header>

        {activeSession?.selectedFile ? (
          <ChatBox
            messages={activeSession?.messages || []}
            loading={loading}
            sendMessage={sendMessage}
            onOpenSource={handleOpenSource}
          />
        ) : (
          <div className="center-view">
            <FileUpload 
              onIngestComplete={handleIngestComplete} 
              chatId={activeSessionId}
            />
          </div>
        )}

        {/* ── SOURCE DRAWER ── */}
        <SourceDrawer 
          isOpen={drawerOpen} 
          onClose={handleCloseDrawer} 
          source={selectedSource} 
        />
      </main>
    </div>
  );
}
