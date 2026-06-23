import React from 'react';

export default function DashboardHeader({
  isAdmin,
  usuarios = [],
  clientes = [],
  proyectos = [],
  materiales = []
}) {
  return (
    <header className="hero-panel">
      <div>
        <span className="eyebrow">Gestor de presupuestos</span>
        <h1>{isAdmin ? 'Panel operativo para presupuestos' : 'Visualización de presupuestos'}</h1>
        <p>{isAdmin ? 'Gestiona clientes y proyectos desde la interfaz para preparar presupuestos usando los usuarios ya registrados.' : 'Consulta presupuestos, listados de medidas y tarifas base de coste.'}</p>
      </div>
      {isAdmin && (
        <div className="hero-stats">
          <div><strong>{usuarios.length}</strong><span>usuarios</span></div>
          <div><strong>{clientes.length}</strong><span>clientes</span></div>
          <div><strong>{proyectos.length}</strong><span>proyectos</span></div>
          <div><strong>{materiales.length}</strong><span>materiales</span></div>
        </div>
      )}
    </header>
  );
}
