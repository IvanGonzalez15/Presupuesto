import React, { useState, useEffect, useRef } from 'react';

export default function CustomDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  isMulti = false,
  disabled = false,
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled && options.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  let displayText = placeholder;
  if (isMulti) {
    const selectedIds = Array.isArray(value) ? value : [];
    if (selectedIds.length > 0) {
      displayText = selectedIds
        .map(id => options.find(o => o.id === id)?.label)
        .filter(Boolean)
        .join(', ');
    } else {
      displayText = 'Sin colaboradores';
    }
  } else {
    const selectedOpt = options.find(o => String(o.id) === String(value));
    if (selectedOpt) {
      displayText = selectedOpt.label;
    }
  }

  const handleSelectSingle = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleSelectMulti = (optionId, checked) => {
    const currentList = Array.isArray(value) ? value : [];
    const updatedList = checked
      ? [...currentList, optionId]
      : currentList.filter(id => id !== optionId);
    onChange(updatedList);
  };

  return (
    <div className="collaborators-selector-container" ref={dropdownRef} style={{ position: 'relative', ...style }}>
      {label && <span className="collaborators-title">{label}</span>}
      
      <div
        role="button"
        tabIndex={disabled || !options.length ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="multiselect-toggle-btn"
        style={{
          width: '100%',
          height: '42px',
          textAlign: 'left',
          padding: '10px 14px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--rounded-lg)',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          cursor: disabled || !options.length ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          outline: 'none',
          opacity: disabled || !options.length ? 0.6 : 1,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%' }}>
          {displayText}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--color-text-secondary)',
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div
          className="collaborators-list-box"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            marginTop: '4px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
            background: 'var(--color-surface-container-high)',
            border: '2px solid var(--color-border)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {isMulti ? (
            <>
              {options.map((opt) => {
                const isSelected = (value || []).includes(opt.id);
                return (
                  <label key={opt.id} className={`collaborator-label ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectMulti(opt.id, e.target.checked)}
                      className="collaborator-checkbox"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
              {!options.length && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', padding: '10px', display: 'block' }}>No hay opciones disponibles</span>}
            </>
          ) : (
            options.map((opt) => {
              const isSelected = String(value) === String(opt.id);
              return (
                <div
                  key={opt.id}
                  className={`collaborator-label ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectSingle(opt.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
