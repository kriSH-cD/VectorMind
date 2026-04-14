import React from 'react';

export default function SourceDrawer({ isOpen, onClose, source }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        <header className="drawer-header">
          <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Source Context</h2>
          <button 
            className="sidebar-item" 
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
            onClick={onClose}
          >
            <span className="icon">close</span>
          </button>
        </header>

        <div className="drawer-content">
          {source ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '16px', borderBottom: '1px dashed var(--border-light)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500' }}>{source.file || 'Document'}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {source.page}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ 
                  backgroundColor: 'var(--accent-soft)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid rgba(37, 99, 235, 0.1)' 
                }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: '500', fontStyle: 'italic' }}>
                    "{source.text}"
                  </p>
                </div>
                
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  This excerpt was used by the AI to generate the answer. The relevance score for this segment was {(source.relevance_score * 100).toFixed(1)}%.
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No source selected.</p>
          )}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
          <button 
            className="sidebar-item" 
            style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}
            disabled
          >
            <span className="icon" style={{ fontSize: '18px', marginRight: '8px' }}>open_in_new</span>
            View full page (Pro)
          </button>
        </div>
      </aside>
    </>
  );
}
