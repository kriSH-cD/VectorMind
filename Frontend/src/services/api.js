/**
 * VectorMind — API Service Layer
 * =================================
 * Production-ready API client for the FastAPI Document QA backend.
 *
 * Features:
 *   - Native fetch API (zero external dependencies)
 *   - Reusable request helper with automatic error parsing
 *   - AbortController-based timeout handling (15s default)
 *   - Structured error messages from backend `detail` field
 *   - Clean async/await pattern throughout
 *
 * Exports:
 *   - uploadFile(file)              → POST /upload (multipart/form-data)
 *   - askQuestion(query, filename)  → POST /query  (application/json)
 */

// ────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────

// Allow production deployment via Environment Variable fallback
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
 * Why a helper?
 *   - DRY: Both uploadFile and askQuestion share the same error handling,
 *     timeout logic, and response parsing.
 *   - Consistency: Every API call goes through the same pipeline.
 *
 * @param {string}  endpoint   - API path (e.g., "/upload", "/query")
 * @param {object}  options    - fetch() options (method, headers, body, etc.)
 * @param {number}  timeoutMs  - Request timeout in milliseconds
 * @returns {Promise<object>}  - Parsed JSON response from the backend
 * @throws {Error}             - On network failure, timeout, or HTTP error
 */
async function request(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const url = `${BASE_URL}${endpoint}`;

  // ── Timeout via AbortController ──
  // Creates a signal that automatically aborts the fetch after `timeoutMs`.
  // This prevents the UI from hanging indefinitely if the backend is down.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    // ── HTTP Error Handling ──
    // The backend returns errors in { "detail": "message" } format.
    // We parse this to give the user a meaningful error instead of "500 Internal Server Error".
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorBody = await response.json();
        // FastAPI returns errors as { "detail": "..." }
        if (errorBody.detail) {
          errorMessage = errorBody.detail;
        }
      } catch {
        // Response body wasn't JSON — use the generic status message
      }

      throw new Error(errorMessage);
    }

    // ── Success: Parse and return JSON ──
    const data = await response.json();
    return data;

  } catch (error) {
    // ── Timeout Detection ──
    // AbortController throws a DOMException with name "AbortError" on timeout.
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. The server may be busy processing your request. Please try again."
      );
    }

    // ── Network Failure Detection ──
    // TypeError is thrown when fetch() itself fails (no internet, DNS failure, CORS block).
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check that the backend is running on " + BASE_URL
      );
    }

    // ── Re-throw parsed HTTP errors (from the block above) ──
    throw error;

  } finally {
    // Always clean up the timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
}


// ────────────────────────────────────────────────────────────────
// API Functions
// ────────────────────────────────────────────────────────────────

/**
 * Upload a PDF file to the backend for ingestion.
 *
 * The backend will:
 *   1. Parse the PDF and extract text per page
 *   2. Chunk the text into overlapping segments
 *   3. Generate embeddings and store in ChromaDB
 *   4. Rebuild the BM25 keyword index
 *
 * @param {File} file - A File object from an <input type="file"> element
 * @returns {Promise<{message: string, filename: string, pages_extracted: number, chunks_created: number}>}
 * @throws {Error} On invalid file type, size exceeded, or server error
 *
 * @example
 *   const input = document.querySelector('input[type="file"]');
 *   const result = await uploadFile(input.files[0]);
 *   console.log(result.chunks_created); // 12
 */
export async function uploadFile(file) {
  // Build multipart/form-data payload
  // Note: Do NOT set Content-Type header manually — fetch sets the correct
  // multipart boundary automatically when given a FormData body.
  const formData = new FormData();
  formData.append("file", file);

  return request(
    "/upload",
    {
      method: "POST",
      body: formData,
    },
    HEAVY_TIMEOUT_MS  // Upload + parsing + embedding can take 60s+ for large PDFs
  );
}


/**
 * Ask a question against uploaded documents.
 *
 * The backend runs the full RAG pipeline:
 *   1. Hybrid retrieval (vector search + BM25 keyword search)
 *   2. Cross-encoder reranking (BAAI/bge-reranker-v2-m3)
 *   3. LLM generation with strict citation rules (GPT-4o)
 *
 * @param {string}      query    - The user's natural language question
 * @param {string|null} filename - Optional: restrict search to a specific PDF (null = search all)
 * @returns {Promise<{answer: string, sources: Array<{page: number, file: string, text: string, relevance_score: number}>}>}
 * @throws {Error} On empty query, server error, or LLM failure
 *
 * @example
 *   const result = await askQuestion("What is the main topic?", "report.pdf");
 *   console.log(result.answer);   // "The main topic is... (Page 1, report.pdf)"
 *   console.log(result.sources);  // [{page: 1, file: "report.pdf", text: "...", relevance_score: 0.92}]
 */
export async function askQuestion(query, filename = null) {
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
      }),
    },
    HEAVY_TIMEOUT_MS  // LLM generation + reranking can take 30s+ on first query
  );
}


/**
 * Inform the backend to wipe the ChromaDB and BM25 store completely.
 * 
 * @returns {Promise<{message: string}>}
 */
export async function clearMemory() {
  return request(
    "/clear",
    {
      method: "POST",
    },
    DEFAULT_TIMEOUT_MS
  );
}
