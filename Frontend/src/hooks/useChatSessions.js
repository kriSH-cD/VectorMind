import { useState, useEffect, useCallback, useRef } from "react";
import { askQuestion } from "../services/api";

/**
 * useChatSessions Hook (Chat-Scoped)
 * =====================================
 * Manages multiple isolated chat sessions.
 * 
 * Key isolation guarantees:
 *   - New Chat: fresh id, empty messages, null selectedFile
 *   - sendMessage: reads current session from ref (not stale closure)
 *   - askQuestion: sends chat_id + current chat's history only
 *   - No cross-chat data leakage anywhere in the pipeline
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

  // ── Refs for stable access in callbacks ──
  // Using refs prevents stale closures in sendMessage and handleIngestComplete.
  const sessionsRef = useRef(sessions);
  const activeSessionIdRef = useRef(activeSessionId);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Persist sessions to localStorage whenever they change.
  // Strip `isNew` from messages so typing animation doesn't replay on refresh.
  useEffect(() => {
    const chatsToSave = sessions
      .filter(s => s.messages.length > 1 || s.selectedFile)
      .map(s => ({
        ...s,
        messages: s.messages.map(({ isNew, ...rest }) => rest),
      }));
    localStorage.setItem("chatgpt_sessions", JSON.stringify(chatsToSave));
  }, [sessions]);

  // Persist the currently active tab
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("chatgpt_active_session", activeSessionId);
    }
  }, [activeSessionId]);

  /**
   * Create a completely new chat session — clean slate.
   * Fresh UUID, empty messages, no selected file.
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
      if (activeSessionIdRef.current === id && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
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
  }, []);

  /**
   * Add a message to a SPECIFIC session by ID (not necessarily the active one).
   * Uses functional update to avoid stale state.
   */
  const addMessageToSession = useCallback((sessionId, message) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, message],
          };
        }
        return session;
      })
    );
  }, []);

  /**
   * Extract chat history suitable for sending to the backend.
   * Only includes role and content — no sources or metadata.
   * Limited to last 10 messages to prevent prompt overflow.
   */
  const getChatHistory = useCallback((sessionId) => {
    const session = sessionsRef.current.find(s => s.id === sessionId);
    if (!session) return [];

    return session.messages
      .filter(m => m.content && m.role)
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
  }, []);

  /**
   * Ingest Complete Handler: Updates the session after files or text are ingested.
   * Captures activeSessionId at call time to prevent cross-chat contamination.
   */
  const handleIngestComplete = useCallback(async (type, data) => {
    // Capture the current session ID AT CALL TIME — not from stale closure
    const currentSessionId = activeSessionIdRef.current;
    let displayLabel = "";

    if (type === "files") {
      displayLabel = data.join(", ");
      const cleanTitle = data.length === 1 ? data[0].replace(/\.pdf$/i, "") : `${data.length} Documents`;
      
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId 
            ? { ...session, selectedFile: data.length === 1 ? data[0] : "Multiple Files", title: cleanTitle } 
            : session
        )
      );
    } else if (type === "text") {
      displayLabel = data;
      
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId 
            ? { ...session, selectedFile: data, title: data } 
            : session
        )
      );
    }

    addMessageToSession(currentSessionId, { 
      role: "user", 
      content: `Ingested: ${displayLabel}`, 
      sources: [] 
    });

    setLoading(true);
    try {
      const contextFile = (type === "files" && data.length > 1) ? null : (type === "files" ? data[0] : data);
      const chatHistory = getChatHistory(currentSessionId);
      
      const response = await askQuestion(
        "Summarize the ingested content",
        contextFile,
        currentSessionId,   // chat_id — scopes to this chat's collection
        chatHistory          // only this chat's history
      );
      
      addMessageToSession(currentSessionId, {
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
        responseTime: response.responseTime,
        isNew: true,
      });
    } catch (error) {
      addMessageToSession(currentSessionId, {
        role: "assistant",
        content: `Error generating summary: ${error.message}`,
        sources: [],
      });
    } finally {
      setLoading(false);
    }
  }, [addMessageToSession, getChatHistory]);

  /**
   * Backward compatibility
   */
  const attachFileToSession = useCallback((filename) => {
    handleIngestComplete("files", [filename]);
  }, [handleIngestComplete]);

  /**
   * Process a user query.
   * Reads session state from ref to prevent stale closures.
   * Sends only THIS chat's history and chat_id.
   */
  const sendMessage = useCallback(async (query) => {
    if (!query || !query.trim()) return;

    const trimmed = query.trim();
    const lowerQuery = trimmed.toLowerCase();

    // Capture current session at call time
    const currentSessionId = activeSessionIdRef.current;

    // 1. Add user message
    addMessageToSession(currentSessionId, { role: "user", content: trimmed, sources: [] });

    // 2. Local Greeting Interceptor
    if (["hi", "hello", "hey"].includes(lowerQuery)) {
      setTimeout(() => {
        addMessageToSession(currentSessionId, {
          role: "assistant",
          content: "Hello! How can I assist you with your document?",
          sources: [],
        });
      }, 400);
      return;
    }

    // 3. Extract file context from the CURRENT session (via ref, not stale closure)
    const currentSession = sessionsRef.current.find(s => s.id === currentSessionId);
    const fileContext = currentSession?.selectedFile || null;

    // 4. Build chat history from THIS session only
    const chatHistory = getChatHistory(currentSessionId);

    // 5. Call backend API with chat_id and history
    setLoading(true);
    try {
      const response = await askQuestion(
        trimmed,
        fileContext,
        currentSessionId,   // chat_id — scopes retrieval to this chat
        chatHistory          // only this chat's messages
      );
      
      addMessageToSession(currentSessionId, { 
        role: "assistant", 
        content: response.answer, 
        sources: response.sources || [],
        responseTime: response.responseTime,
        isNew: true
      });
    } catch (error) {
      addMessageToSession(currentSessionId, { 
        role: "assistant", 
        content: `API Error: ${error.message}`, 
        sources: [] 
      });
    } finally {
      setLoading(false);
    }

  }, [addMessageToSession, getChatHistory]);

  // Derived state
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
    handleIngestComplete,
  };
}
