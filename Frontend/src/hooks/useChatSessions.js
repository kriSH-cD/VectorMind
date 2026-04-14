import { useState, useEffect, useCallback } from "react";
import { askQuestion } from "../services/api";

/**
 * useChatSessions Hook
 * Manages multiple chat sessions using localStorage for persistence.
 */
export function useChatSessions() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("chatgpt_sessions");
    let parsed = [];
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        // Clean up empty ghost chats from previous sessions
        parsed = loaded.filter(s => s.messages.length > 1 || s.selectedFile);
      } catch (e) {
        console.error("Failed to parse sessions from localStorage");
      }
    }
    
    if (parsed.length > 0) {
      return parsed;
    }
    
    // Only create a fresh chat on page load if history is entirely empty
    const freshChat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [
        { role: "assistant", content: "Hi, how can I help you?", sources: [] }
      ],
      selectedFile: null,
    };

    return [freshChat];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedActiveId = localStorage.getItem("chatgpt_active_session");
    if (savedActiveId && sessions.some(s => s.id === savedActiveId)) {
        return savedActiveId;
    }
    return sessions.length > 0 ? sessions[0].id : null;
  });

  const [loading, setLoading] = useState(false);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    // Optional: Do not persist completely empty chats to prevent infinite clutter
    const chatsToSave = sessions.filter(s => s.messages.length > 1 || s.selectedFile);
    localStorage.setItem("chatgpt_sessions", JSON.stringify(chatsToSave));
  }, [sessions]);

  // Persist the currently active tab
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("chatgpt_active_session", activeSessionId);
    }
  }, [activeSessionId]);

  /**
   * Create a completely new chat session with a default greeting.
   */
  const createNewChat = useCallback(() => {
    const newChat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [
        { role: "assistant", content: "Hi, how can I help you?", sources: [] }
      ],
      selectedFile: null,
    };
    setSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newChat.id);
  }, []);

  /**
   * Switch the active chat view.
   */
  const switchSession = useCallback((id) => {
    setActiveSessionId(id);
  }, []);

  /**
   * Rename a specific chat session.
   */
  const renameSession = useCallback((id, newTitle) => {
    if (!newTitle.trim()) return;
    setSessions((prev) => 
      prev.map(session => session.id === id ? { ...session, title: newTitle } : session)
    );
  }, []);

  /**
   * Delete a specific chat session.
   */
  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const filtered = prev.filter(session => session.id !== id);
      // If we deleted the active session, fallback to the first one available
      if (activeSessionId === id && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        // If we deleted the last session, create a default one
        const fallbackId = crypto.randomUUID();
        setActiveSessionId(fallbackId);
        return [{
          id: fallbackId,
          title: "Chat 1",
          messages: [
            { role: "assistant", content: "Hi, how can I help you?", sources: [] }
          ],
          selectedFile: null,
        }];
      }
      return filtered;
    });
  }, [activeSessionId]);

  /**
   * Add a message to the currently active session.
   * NOTE: This allows us to hook up backend API calls iteratively later.
   */
  const addMessageToActiveSession = useCallback((message) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, message],
          };
        }
        return session;
      })
    );
  }, [activeSessionId]);

  /**
   * File Upload Integrator: Maps a document to the active session
   * and triggers an auto-summarization sequence.
   */
  const attachFileToSession = useCallback(async (filename) => {
    // 1. Map file to session and automatically rename the chat title
    const cleanTitle = filename.replace(/\.pdf$/i, "");
    
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId 
          ? { ...session, selectedFile: filename, title: cleanTitle } 
          : session
      )
    );

    // 2. Add placeholder loading message for the summary
    addMessageToActiveSession({ 
      role: "user", 
      content: `Uploaded: ${filename}`, 
      sources: [] 
    });

    setLoading(true);
    try {
      // 3. Call backend pipeline to summarize
      const response = await askQuestion("Summarize this document", filename);
      
      addMessageToActiveSession({
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
      });
    } catch (error) {
      addMessageToActiveSession({
        role: "assistant",
        content: `Error generating summary: ${error.message}`,
        sources: [],
      });
    } finally {
      setLoading(false);
    }
  }, [activeSessionId, addMessageToActiveSession]);

  /**
   * Process a user query.
   * Intercepts simple greetings to answer locally without backend calls.
   */
  const sendMessage = useCallback(async (query) => {
    if (!query || !query.trim()) return;

    const trimmed = query.trim();
    const lowerQuery = trimmed.toLowerCase();

    // 1. Add user message
    addMessageToActiveSession({ role: "user", content: trimmed, sources: [] });

    // 2. Local Greeting Interceptor
    if (["hi", "hello", "hey"].includes(lowerQuery)) {
      setTimeout(() => {
        addMessageToActiveSession({
          role: "assistant",
          content: "Hello! How can I assist you with your document?",
          sources: [],
        });
      }, 400); // Small delay to feel natural
      return; // Exit early, do not call backend
    }

    // 3. Extranct file context from active session
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const fileContext = currentSession?.selectedFile || null;

    // 4. Call real backend API
    setLoading(true);
    try {
      const response = await askQuestion(trimmed, fileContext);
      
      addMessageToActiveSession({ 
        role: "assistant", 
        content: response.answer, 
        sources: response.sources || [] 
      });
    } catch (error) {
      addMessageToActiveSession({ 
        role: "assistant", 
        content: `API Error: ${error.message}`, 
        sources: [] 
      });
    } finally {
      setLoading(false);
    }

  }, [activeSessionId, sessions, addMessageToActiveSession]);

  // Derived state: Get the currently active session object easily
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return {
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
  };
}
