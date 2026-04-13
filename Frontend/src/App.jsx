/**
 * VectorMind — App Component
 * =============================
 * Root component that assembles the full Document QA interface.
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │  Header (branding + clear chat)         │
 *   ├──────────┬──────────────────────────────┤
 *   │ Sidebar  │  Chat Area                   │
 *   │ - Upload │  - Messages / Empty state    │
 *   │ - Docs   │  - Typing indicator          │
 *   │          │  - Chat input                │
 *   └──────────┴──────────────────────────────┘
 */

import Home from "./pages/Home";

export default function App() {
  return (
    <div className="app-root">
      <Home />
    </div>
  );
}
