import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = '¿Confirmar acción?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'fadeIn 0.15s ease'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: 'var(--color-text-primary, #0f172a)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isDanger ? '#fef2f2' : 'var(--color-surface-container-high, #f1f5f9)',
              color: isDanger ? '#ef4444' : 'var(--color-primary, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary, #0f172a)' }}>
              {title}
            </h3>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-secondary, #64748b)', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #cbd5e1)',
              background: 'var(--color-surface, #ffffff)',
              color: 'var(--color-text-primary, #334155)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: isDanger ? '#dc2626' : 'var(--color-primary, #2563eb)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
