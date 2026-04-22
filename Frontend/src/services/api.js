/**
 * VectorMind — API Service Layer (Chat-Scoped)
 * ================================================
 * Production-ready API client with per-chat session isolation.
 *
 * Every API call now includes a `chat_id` to ensure the backend
 * routes data to/from the correct ChromaDB collection.
 *
 * Exports:
 *   - uploadFiles(files, chatId)               → POST /upload?chat_id=xxx
 *   - uploadFile(file, chatId)                 → backward compat wrapper
 *   - ingestText(text, filename, chatId)       → POST /ingest-text
 *   - askQuestion(query, filename, chatId, chatHistory) → POST /query
 *   - clearMemory(chatId)                      → POST /clear?chat_id=xxx
 */

// ────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "https://vectormindb.onrender.com");

/** Default timeout in milliseconds for all API requests */
const DEFAULT_TIMEOUT_MS = 15_000;

/** Extended timeout for heavy operations (upload, query with LLM) */
const HEAVY_TIMEOUT_MS = 120_000;


// ────────────────────────────────────────────────────────────────
// Generic Request Helper
// ────────────────────────────────────────────────────────────────

/**
 * Reusable fetch wrapper with timeout, error parsing, and structured responses.
 *
 * @param {string}  endpoint   - API path (e.g., "/upload", "/query")
 * @param {object}  options    - fetch() options (method, headers, body, etc.)
 * @param {number}  timeoutMs  - Request timeout in milliseconds
 * @returns {Promise<object>}  - Parsed JSON response from the backend
 * @throws {Error}             - On network failure, timeout, or HTTP error
 */
async function request(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = performance.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorBody = await response.json();
        if (errorBody.detail) {
          errorMessage = errorBody.detail;
        }
      } catch {
        // Response body wasn't JSON
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const endTime = performance.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);
    
    return { ...data, responseTime };

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. The server may be busy processing your request. Please try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check that the backend is running on " + BASE_URL
      );
    }

    throw error;

  } finally {
    clearTimeout(timeoutId);
  }
}


// ────────────────────────────────────────────────────────────────
// API Functions (Chat-Scoped)
// ────────────────────────────────────────────────────────────────

/**
 * Upload PDF files to a specific chat's collection.
 *
 * @param {File[]} files  - Array of File objects
 * @param {string} chatId - Chat session ID for collection scoping
 * @returns {Promise<object>}
 */
export async function uploadFiles(files, chatId) {
  const formData = new FormData();
  
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  // Pass chat_id as a query parameter (multipart body can't mix JSON fields easily)
  const endpoint = chatId ? `/upload?chat_id=${encodeURIComponent(chatId)}` : "/upload";

  return request(
    endpoint,
    {
      method: "POST",
      body: formData,
    },
    HEAVY_TIMEOUT_MS
  );
}

/**
 * Backward compatibility for single file upload.
 */
export async function uploadFile(file, chatId) {
  return uploadFiles([file], chatId);
}


/**
 * Ingest raw text into a specific chat's collection.
 *
 * @param {string} text     - The raw text content
 * @param {string} filename - A label for this text
 * @param {string} chatId   - Chat session ID for collection scoping
 * @returns {Promise<object>}
 */
export async function ingestText(text, filename = "Raw Text", chatId = null) {
  return request(
    "/ingest-text",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        filename,
        chat_id: chatId,
      }),
    },
    HEAVY_TIMEOUT_MS
  );
}


/**
 * Ask a question scoped to a specific chat's documents.
 * Sends only this chat's history to the LLM — no cross-chat leakage.
 *
 * @param {string}      query       - The user's question
 * @param {string|null} filename    - Optional: restrict to a specific PDF
 * @param {string}      chatId      - Chat session ID for collection scoping
 * @param {Array}       chatHistory - This chat's conversation history only
 * @returns {Promise<object>}
 */
export async function askQuestion(query, filename = null, chatId = null, chatHistory = []) {
  return request(
    "/query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        filename,
        chat_id: chatId,
        chat_history: chatHistory,
      }),
    },
    HEAVY_TIMEOUT_MS
  );
}


/**
 * Clear documents for a specific chat, or all if no chatId.
 * 
 * @param {string} chatId - Chat session ID
 * @returns {Promise<object>}
 */
export async function clearMemory(chatId = null) {
  const endpoint = chatId ? `/clear?chat_id=${encodeURIComponent(chatId)}` : "/clear";
  return request(
    endpoint,
    {
      method: "POST",
    },
    DEFAULT_TIMEOUT_MS
  );
}
