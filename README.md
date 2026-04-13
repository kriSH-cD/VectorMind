# VectorMind (Production-Grade Hybrid RAG System)

**VectorMind** is a high-performance, ChatGPT-style Document QA System. It empowers users to autonomously upload PDF documents into isolated chat sessions, automatically extract highly relevant summaries, and execute conversational Q&A against their documents using state-of-the-art **Hybrid RAG** (Retrieval-Augmented Generation) technologies.

This project goes beyond simple vector search by combining robust lexical matching, dense embeddings, an advanced reranker model, and defensive LLM generation constraints all wrapped in a sleek, zero-dependency custom React interface modelled after ChatGPT.

---

## 🌟 Key Features

1. **ChatGPT-Style UI**: Sleek, immersive dark-theme interface built completely with native React hooks and native CSS glassmorphism (no bulky libraries).
2. **True Session Isolation**: Work on multiple documents simultaneously. Each chat session in the sidebar operates as a locked sandbox. Document A in Chat 1 will never pollute answers in Chat 2.
3. **Advanced Hybrid Retrieval Engine**: 
   - Uses `all-MiniLM-L6-v2` dense vectors (ChromaDB) for semantic/conceptual queries.
   - Uses `Rank-BM25` for precise keyword/lexical searches.
   - Combines the top results and automatically reranks them sequentially based on absolute relevance.
4. **Defensive Source Citations**: AI Hallucination mitigations are strictly enforced natively. The AI produces exact page origins with similarity confidence scores mapping visually to sleek, interactable UI dropdowns.
5. **No Database Dependencies**: VectorMind utilizes SQLite-backed persisted `ChromaDB` directly on the local machine ensuring complete data ownership without paid DbaaS overhead.
6. **Smart Interceptors**: Intelligent React hook interceptors capture standard pleasantries (`hi`, `hello`) naturally and locally to avoid unnecessary LLM latency.

---

## 🛠️ Architecture & Tech Stack

### 💻 Frontend (The Client)
- **Framework**: `React v19` powered by `Vite` for lightning-fast HMR and compilation.
- **State Management**: Zero Redux. Perfectly encapsulated custom Hooks (`useChatSessions`) leveraging standard `localStorage` persisting robust state mapping natively inside the DOM.
- **Styling**: `Vanilla CSS` with a meticulously curated multi-layer dark theme mimicking ChatGPT aesthetics (`var(--bg-primary)`, `let(--accent-primary)`).
- **Icons**: `Lucide-React`.

### ⚙️ Backend (The Engine)
- **Framework**: `FastAPI` (Python) operating on high-performance `Uvicorn` asynchronous threads.
- **Vector Database**: `ChromaDB` configured for persistent localized storage cleanly mapping overlapping chunks.
- **Sparse Index**: `rank_bm25` (BM25Okapi) token-based lexical indexer to catch exact terminologies that embeddings frequently miss.
- **Reranker Pipeline**: `bge-reranker-base` Cross-Encoder evaluating the final retrieved set.
- **LLM Connectivity**: `OpenRouter API` handling standard downstream Generation against complex chunk structures contextually. 

---

## 🚀 Getting Started

### 1. Backend Setup
1. CD into the Backend folder: `cd Backend`
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install strict dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file referencing your OpenRouter Key:
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```
5. Spin up the FastAPI API logic sequence:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Open a new terminal instance and CD into the Frontend folder: `cd Frontend`
2. Install npm modules:
   ```bash
   npm install
   ```
3. Boot the local Vite development server:
   ```bash
   npm run dev
   ```
4. Connect via browser `localhost:5174` and initiate a fresh chat!

---

## 🔐 System Pipeline Overview
1. **Ingestion**: PDF Uploaded `->` `PyMuPDF` extracts text per page `->` Text is logically chunked (500 tokens / 100 overlap) `->` `MiniLM` converts context to vectors `->` Inserted to `ChromaDB`.
2. **Retrieval**: User question initiates async task `->` Vector distance search `+` BM25 keyword search `->` Top 10 documents collected.
3. **Reranking**: `BGE-Reranker` scores all 10 contexts precisely against the question `->` Top 5 contexts returned.
4. **Generation**: Top 5 injected into secure LLM Prompt forcing strict exact citation mappings `(Page X)` `->` React parses text natively while dumping sources to dropdown UI modules safely.
