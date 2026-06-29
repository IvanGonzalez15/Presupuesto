import './App.css';

import Login from './components/Login';
import Setup from './components/Setup';
import Materiales from './components/Materiales';
import Presupuestos from './components/Presupuestos';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import useAuth from './hooks/useAuth';
import useDashboardData from './hooks/useDashboardData';
import useElementActions from './hooks/useElementActions';
import { parseElementExtraData } from './utils/elementHelpers';

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function App() {
  const {
    theme,
    toggleTheme,
    token,
    currentUser,
    loginError,
    handleLogin,
    handleLogout
  } = useAuth();

  const {
    clientes,
    setClientes,
    usuarios,
    setUsuarios,
    proyectos,
    setProyectos,
    elementos,
    setElementos,
    materiales,
    setMateriales,
    selectedProjectId,
    setSelectedProjectId,
    status,
    setStatusRaw,
    setStatus,
    activeTab,
    setActiveTab,
    subTab,
    setSubTab,
    isAdmin,
    isViewer,
    selectedClientIdFilter,
    setSelectedClientIdFilter,
    filteredProyectos,
    selectedProject,
    projectItems,
    total,
    refreshProjects
  } = useDashboardData(
    token,
    currentUser,
    () => handleLogout()
  );

  const {
    clearPendingUpdates,
    handleUserCreate,
    createCliente,
    createProyecto,
    saveMaterial,
    deleteMaterial,
    deleteProject,
    deleteElemento,
    handleUploadPhoto,
    updateElementPhoto,
    updateElementExtraValue,
    updateElementQuantity,
    updateElementPrice,
    handleUpdateProject,
    handleProjectFieldChange,
    createElemento,
    exportToExcel,
    handleImportExcel
  } = useElementActions({
    currentUser,
    isAdmin,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    projectItems,
    refreshProjects,
    setElementos,
    setClientes,
    setUsuarios,
    setProyectos,
    setMateriales,
    setStatus,
    money
  });

  const onLogout = () => {
    handleLogout(clearPendingUpdates);
  };

  if (!token) {
    return <Login onLogin={(nombre, password) => handleLogin(nombre, password, setStatus)} error={loginError} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        currentUser={currentUser}
        isAdmin={isAdmin}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content-area">
        <DashboardHeader
          isAdmin={isAdmin}
          usuarios={usuarios}
          clientes={clientes}
          proyectos={proyectos}
          materiales={materiales}
        />

        {activeTab === 'registro' && isAdmin && (
          <Setup
            clientes={clientes}
            usuarios={usuarios}
            proyectos={proyectos}
            createCliente={createCliente}
            createProyecto={createProyecto}
            onUserCreate={handleUserCreate}
            statusMessage={status}
            setStatus={setStatus}
          />
        )}

        {activeTab === 'materiales' && (
          <Materiales
            materiales={materiales}
            isAdmin={isAdmin}
            money={money}
            saveMaterial={saveMaterial}
            deleteMaterial={deleteMaterial}
          />
        )}

        {activeTab === 'presupuestos' && (
          <Presupuestos
            proyectos={filteredProyectos}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            deleteProject={deleteProject}
            money={money}
            subTab={subTab}
            setSubTab={setSubTab}
            selectedProject={selectedProject}
            exportToExcel={exportToExcel}
            handleImportExcel={handleImportExcel}
            handleUpdateProject={handleUpdateProject}
            clientes={clientes}
            usuarios={usuarios}
            handleProjectFieldChange={handleProjectFieldChange}
            total={total}
            createElemento={createElemento}
            projectItems={projectItems}
            updateElementQuantity={updateElementQuantity}
            updateElementPrice={updateElementPrice}
            deleteElemento={deleteElemento}
            updateElementExtraValue={updateElementExtraValue}
            parseElementExtraData={parseElementExtraData}
            isAdmin={isAdmin}
            isViewer={isViewer}
            selectedClientIdFilter={selectedClientIdFilter}
            setSelectedClientIdFilter={setSelectedClientIdFilter}
            handleUploadPhoto={handleUploadPhoto}
            updateElementPhoto={updateElementPhoto}
            setStatus={setStatus}
          />
        )}
      </main>
      {status && <footer className="status-bar" onClick={() => setStatusRaw('')} title="Haga clic para cerrar">{status}</footer>}
    </div>
  );
}

export default App;
