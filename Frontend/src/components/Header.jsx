/**
 * VectorMind — Header Component
 * ================================
 * Top navigation bar with branding and action buttons.
 */

import { Brain, Trash2 } from "lucide-react";

export default function Header({ onClearChat, hasMessages }) {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">
          <Brain size={20} />
        </div>
        <div>
          <h1 className="header__title">VectorMind</h1>
          <p className="header__subtitle">Document QA • Hybrid RAG</p>
        </div>
      </div>

      <div className="header__actions">
        {hasMessages && (
          <button className="header__btn" onClick={onClearChat} title="Clear chat history">
            <Trash2 size={14} />
            Clear Chat
          </button>
        )}
      </div>
    </header>
  );
}
