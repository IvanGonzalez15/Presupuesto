import React, { useState, useEffect } from 'react';
import { versionProyectoService } from '../../services/api';

export default function VersionHistoryModal({
  isOpen,
  onClose,
  proyectoId,
  onProjectRestored,
  setStatus
}) {
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    if (isOpen && proyectoId) {
      cargarVersiones();
    }
  }, [isOpen, proyectoId]);

  const cargarVersiones = async () => {
    setLoading(true);
    try {
      const { data } = await versionProyectoService.getVersiones(proyectoId);
      setVersiones(data);
    } catch (err) {
      console.error(err);
      setStatus('Error al cargar el historial de versiones.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearVersion = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await versionProyectoService.crearVersion(proyectoId, { descripcion: descripcion.trim() });
      setDescripcion('');
      setStatus('Versión guardada correctamente.');
      cargarVersiones();
    } catch (err) {
      console.error(err);
      setStatus(`Error al crear la versión: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurar = async (versionId, versionNumber) => {
    if (restoringId) return;
    const confirmMessage = `⚠️ ATENCIÓN: Al restaurar la Versión ${versionNumber}, se eliminarán todas las partidas actuales y se sobrescribirá la información de este presupuesto.\n\n¿Estás seguro de que deseas continuar?`;
    if (!window.confirm(confirmMessage)) return;

    setRestoringId(versionId);
    try {
      await versionProyectoService.restaurarVersion(proyectoId, versionId);
      setStatus(`Presupuesto restaurado con éxito a la Versión ${versionNumber}.`);
      if (onProjectRestored) {
        await onProjectRestored();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setStatus(`Error al restaurar versión: ${err.response?.data?.message || err.message}`);
    } finally {
      setRestoringId(null);
    }
  };

  const handleEliminar = async (versionId, versionNumber) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la Versión ${versionNumber}?`)) return;
    try {
      await versionProyectoService.eliminarVersion(proyectoId, versionId);
      setStatus(`Versión ${versionNumber} eliminada correctamente.`);
      cargarVersiones();
    } catch (err) {
      console.error(err);
      setStatus(`Error al eliminar versión: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--color-surface-container)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-surface-container-high)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Historial de Cambios y Versiones
          </h2>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0
            }}
          >&times;</button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Form to create version */}
          <form onSubmit={handleCrearVersion} style={{
            background: 'var(--color-surface-container-low)',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid var(--color-border-light)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                Congelar estado actual del presupuesto
              </span>
              <input
                type="text"
                placeholder="Ej. Revisión final antes de enviar al cliente..."
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={saving}
              style={{
                padding: '10px 18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                height: '38px',
                fontSize: '0.85rem'
              }}
            >
              {saving ? 'Guardando...' : 'Crear Snapshot'}
            </button>
          </form>

          {/* Version list */}
          <div>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 10px 0', color: 'var(--color-text-primary)' }}>Versiones Guardadas</h3>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '20px 0' }}>Cargando historial...</p>
            ) : (
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-container-high)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Versión</th>
                      <th style={{ padding: '10px' }}>Fecha de Guardado</th>
                      <th style={{ padding: '10px' }}>Usuario</th>
                      <th style={{ padding: '10px' }}>Notas / Descripción</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versiones.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          <span style={{
                            background: 'var(--color-surface-container-highest)',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem'
                          }}>
                            v{v.version}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--color-text-secondary)' }}>
                          {new Date(v.fecha_creacion).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '10px' }}>{v.Creador?.nombre || 'Usuario'}</td>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{v.descripcion}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleRestaurar(v.id, v.version)}
                              disabled={restoringId !== null}
                              style={{
                                padding: '5px 12px',
                                background: restoringId === v.id ? 'var(--color-text-secondary)' : 'transparent',
                                border: '1px solid var(--color-primary)',
                                color: 'var(--color-primary)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (restoringId !== v.id) {
                                  e.target.style.background = 'var(--color-primary)';
                                  e.target.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (restoringId !== v.id) {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = 'var(--color-primary)';
                                }
                              }}
                            >
                              {restoringId === v.id ? 'Restaurando...' : 'Restaurar'}
                            </button>
                             <button
                              onClick={() => handleEliminar(v.id, v.version)}
                              style={{
                                padding: '5px 12px',
                                background: 'transparent',
                                border: '1px solid var(--color-danger)',
                                color: 'var(--color-danger)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'var(--color-danger)';
                                e.target.style.color = 'var(--color-danger-bg)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'var(--color-danger)';
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {versiones.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                          No hay versiones congeladas para este presupuesto.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--color-surface-container-high)'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
