import React from 'react';

export default function Materiales({
  materiales,
  materialDraft,
  editingMaterialId,
  isAdmin,
  money,
  updateDraft,
  setMaterialDraft,
  saveMaterial,
  editMaterial,
  cancelMaterialEdit,
  deleteMaterial
}) {
  return (
    <section className="panel materials-panel">
      <div className="section-title"><span>03</span><h2>Materiales</h2></div>
      <form className="material-form" onSubmit={saveMaterial}>
        <label className="field">
          <span>Nombre del material <em>Obligatorio</em></span>
          <input disabled={!isAdmin} name="nombre" onChange={updateDraft(setMaterialDraft)} placeholder="Ej. Tablero MDF" required value={materialDraft.nombre} />
        </label>
        <label className="field">
          <span>Precio de venta</span>
          <input disabled={!isAdmin} min="0" name="precio_venta" onChange={updateDraft(setMaterialDraft)} step="0.01" type="number" value={materialDraft.precio_venta} />
        </label>
        <label className="field">
          <span>Características</span>
          <textarea disabled={!isAdmin} name="caracteristicas" onChange={updateDraft(setMaterialDraft)} placeholder="Medidas, acabado, proveedor..." value={materialDraft.caracteristicas} />
        </label>
        <label className="field">
          <span>Notas</span>
          <textarea disabled={!isAdmin} name="notas" onChange={updateDraft(setMaterialDraft)} placeholder="Observaciones internas" value={materialDraft.notas} />
        </label>
        <div className="material-actions">
          <button disabled={!isAdmin} type="submit">{editingMaterialId ? 'Guardar cambios' : 'Crear material'}</button>
          {editingMaterialId && <button className="secondary-action" onClick={cancelMaterialEdit} type="button">Cancelar</button>}
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
              <button disabled={!isAdmin} className="edit-btn" onClick={() => editMaterial(material)} type="button">Editar</button>
              <button disabled={!isAdmin} className="delete-btn-danger" onClick={() => deleteMaterial(material.id)} type="button">Eliminar</button>
            </div>
          </article>
        ))}
        {!materiales.length && <p className="empty-state">Aún no hay materiales registrados.</p>}
      </div>
    </section>
  );
}
