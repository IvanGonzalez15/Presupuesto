import React, { useState, useEffect, useRef } from 'react';

export default function CustomClientSelect({ value, onChange, clientes }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedClient = clientes.find(c => String(c.id) === String(value));
  const displayText = selectedClient ? selectedClient.Nombre : 'Todos los clientes';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="custom-select-container" style={{ position: 'relative', width: '100%', minWidth: '200px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'var(--color-surface)',
          border: '2px solid var(--color-border)',
          borderRadius: 'var(--rounded-lg)',
          fontSize: '0.85rem',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      >
        <span>{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--rounded-lg)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            padding: '4px 0',
            margin: 0,
            listStyle: 'none'
          }}
        >
          <li
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              background: value === '' ? 'var(--color-surface-container)' : 'var(--color-surface)',
              fontWeight: value === '' ? '700' : '500',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-container-high)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = value === '' ? 'var(--color-surface-container)' : 'var(--color-surface)'; }}
          >
            Todos los clientes
          </li>
          {clientes.map((c) => {
            const isSelected = String(c.id) === String(value);
            return (
              <li
                key={c.id}
                onClick={() => { onChange(String(c.id)); setIsOpen(false); }}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface)',
                  fontWeight: isSelected ? '700' : '500',
                  transition: 'background 0.15s ease',
                  borderTop: '1px solid var(--color-border-light)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-container-high)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface)'; }}
              >
                {c.Nombre}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
