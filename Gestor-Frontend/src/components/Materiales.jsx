import React, { useState } from 'react';

const initialMaterial = { nombre: '', precio_venta: 0, caracteristicas: '', notas: '' };

export default function Materiales({
  materiales,
  isAdmin,
  money,
  saveMaterial,
  deleteMaterial
}) {
  const [materialDraft, setMaterialDraft] = useState(initialMaterial);
  const [editingMaterialId, setEditingMaterialId] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMaterialDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMaterial(materialDraft, editingMaterialId);
    setMaterialDraft(initialMaterial);
    setEditingMaterialId('');
  };

  const handleEdit = (material) => {
    setEditingMaterialId(String(material.id));
    setMaterialDraft({
      nombre: material.nombre,
      precio_venta: material.precio_venta,
      caracteristicas: material.caracteristicas || '',
      notas: material.notas || '',
    });
  };

  const handleCancel = () => {
    setMaterialDraft(initialMaterial);
    setEditingMaterialId('');
  };

  return (
    <section className="panel materials-panel">
      <div className="section-title"><span>03</span><h2>Materiales</h2></div>
      <form className="material-form" onSubmit={handleSubmit} autoComplete="off">
        <label className="field">
          <span>Nombre del material <em>Obligatorio</em></span>
          <input disabled={!isAdmin} name="nombre" onChange={handleInputChange} placeholder="Ej. Tablero MDF" required value={materialDraft.nombre} autoComplete="off" />
        </label>
        <label className="field">
          <span>Precio de venta</span>
          <input disabled={!isAdmin} min="0" name="precio_venta" onChange={handleInputChange} step="0.01" type="number" value={materialDraft.precio_venta} autoComplete="off" />
        </label>
        <label className="field">
          <span>Características</span>
          <textarea disabled={!isAdmin} name="caracteristicas" onChange={handleInputChange} placeholder="Medidas, acabado, proveedor..." value={materialDraft.caracteristicas} />
        </label>
        <label className="field">
          <span>Notas</span>
          <textarea disabled={!isAdmin} name="notas" onChange={handleInputChange} placeholder="Observaciones internas" value={materialDraft.notas} />
        </label>
        <div className="material-actions">
          <button disabled={!isAdmin} type="submit">{editingMaterialId ? 'Guardar cambios' : 'Crear material'}</button>
          {editingMaterialId && <button className="secondary-action" onClick={handleCancel} type="button">Cancelar</button>}
        </div>
      </form>
      <div className="materials-list">
        {materiales.map((material) => (
          <article key={material.id}>
            <div className="material-info">
              <strong>{material.nombre}</strong>
              <small>{material.caracteristicas || 'Sin características'}</small>
              <small>{material.notas || 'Sin notas'}</small>
            </div>
            <strong className="material-price">{money.format(Number(material.precio_venta || 0))}</strong>
            <div className="material-row-actions">
              <button disabled={!isAdmin} className="edit-btn" onClick={() => handleEdit(material)} type="button">Editar</button>
              <button disabled={!isAdmin} className="delete-btn-danger" onClick={() => deleteMaterial(material.id)} type="button">Eliminar</button>
            </div>
          </article>
        ))}
        {!materiales.length && <p className="empty-state">Aún no hay materiales registrados.</p>}
      </div>
    </section>
  );
}
