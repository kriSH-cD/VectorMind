# VectorMind — Frontend 🎨

This directory contains the React user interface for the VectorMind Document QA system.

## Features
- **Zero-Dependency Styling:** All visual effects, glassmorphism, responsive flex layouts, and custom scrollbars were written in pure native CSS (`index.css`) without bloated frameworks like Tailwind or Bootstrap.
- **Robust State Management:** The entire chat system, document selection, and loading states are gracefully managed using a custom, optimized `useChat.js` hook that prevents re-render bloat.
- **Drag-and-Drop Ingestion:** Effortlessly drag PDF files directly into the UI. The interface will instantly shift into an explicit staged-upload flow.
- **Inline Citations & UX:** Wait indicators, source-relevance sorting, and text truncation ensure a premium chat experience.

## Quick Start

1. Install Node.js standard dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development engine:
   ```bash
   npm run dev
   ```

The application runs on `http://localhost:5174` (or `5173`) and automatically expects the FastAPI backend to be alive and accepting traffic on `http://localhost:8000`.

## Component Structure

- **`App.jsx`**: The main layout orchestrator configuring the application grid.
- **`/components/FileUpload.jsx`**: The dedicated sidebar upload engine.
- **`/components/ChatBox.jsx`**: The message renderer + scrolling manager + input form.
- **`/components/Message.jsx`**: Dynamic Left/Right conversation bubbles.
- **`/components/SourceList.jsx`**: The citation renderer directly attached to AI responses.
- **`/services/api.js`**: The isolated HTTP adapter executing `fetch` against the Python API.
