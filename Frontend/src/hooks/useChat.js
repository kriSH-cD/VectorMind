/**
 * VectorMind — useChat Hook
 * ============================
 * Custom React hook that manages all chat-related state and logic.
 *
 * Responsibilities:
 *   - Maintains the message history (user + assistant messages)
 *   - Handles sending queries to the backend via the API service
 *   - Tracks loading state for UI indicators
 *   - Manages the currently selected document filter
 *   - Provides chat reset functionality
 *
 * Usage:
 *   const { messages, loading, selectedFile, sendMessage, setSelectedFile, clearChat } = useChat();
 */

import { useState, useCallback, useEffect } from "react";
import { askQuestion, clearMemory } from "../services/api";


// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

/** Fallback message shown when the API call fails for any reason */
const ERROR_MESSAGE = "Something went wrong. Please try again.";


// ────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────

export function useChat() {
  // ── State ──
  // messages: Array of { role: "user"|"assistant", content: string, sources: [] }
  // loading:  true while waiting for the backend response
  // selectedFile: filename string to restrict retrieval, or null for all docs
  const [messages, setMessages] = useState(() => {
    // Check if the page is being reloaded or opened freshly
    const navEntries = performance.getEntriesByType("navigation");
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

    if (!isReload) {
      // Fresh visit (not a reload) -> clear previous memory
      sessionStorage.removeItem("vectormind_chat");
      return [];
    }

    // It is a reload -> try to restore memory
    const saved = sessionStorage.getItem("vectormind_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ── Persistence ──
  // Save messages to session storage whenever they change
  useEffect(() => {
    sessionStorage.setItem("vectormind_chat", JSON.stringify(messages));
  }, [messages]);

  // Handle Backend Memory Clear on Fresh Load
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

    if (!isReload) {
      // If the user navigates here freshly (not a reload),
      // instruct the backend to aggressively wipe ChromaDB and BM25.
      console.log("[useChat] Fresh visit detected. Wiping backend vector store...");
      clearMemory().catch((err) => console.error("Failed to clear backend memory:", err));
    }
  }, []);


  /**
   * Send a user query through the RAG pipeline.
   *
   * Flow:
   *   1. Append the user's message to the chat history immediately (optimistic UI).
   *   2. Set loading = true so the UI can show a typing indicator.
   *   3. Call askQuestion() from the API service layer.
   *   4. Append the assistant's response (answer + sources) to the chat history.
   *   5. Set loading = false.
   *
   * On error:
   *   - Appends a generic error message as an assistant response.
   *   - Does NOT crash the app or clear existing messages.
   *
   * @param {string} query - The user's natural language question
   */
  const sendMessage = useCallback(async (query) => {
    // Guard: ignore empty queries
    if (!query || !query.trim()) return;

    const trimmedQuery = query.trim();

    // Step 1: Add the user's message to chat history (instant feedback)
    const userMessage = {
      role: "user",
      content: trimmedQuery,
      sources: [],
    };

    setMessages((prev) => [...prev, userMessage]);

    // Step 2: Enter loading state
    setLoading(true);

    try {
      // Step 3: Call the backend RAG pipeline
      const response = await askQuestion(trimmedQuery, selectedFile);

      // Step 4: Add the assistant's response to chat history
      const assistantMessage = {
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      // Step 4 (error path): Add a graceful error message
      // The original error is logged for debugging but the user sees a friendly message.
      console.error("[useChat] Query failed:", error.message);

      const errorMessage = {
        role: "assistant",
        content: ERROR_MESSAGE,
        sources: [],
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      // Step 5: Always exit loading state, success or failure
      setLoading(false);
    }
  }, [selectedFile]);


  /**
   * Clear all messages and reset the chat to its initial state.
   * Does NOT reset the selected file filter.
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem("vectormind_chat");
  }, []);


  // ── Public API ──
  return {
    messages,
    loading,
    selectedFile,
    sendMessage,
    setSelectedFile,
    clearChat,
  };
}
