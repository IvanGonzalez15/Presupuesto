import './App.css';

import Login from './components/Login';
import Setup from './components/Setup';
import Presupuestos from './components/Presupuestos';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import useAuth from './hooks/useAuth';
import useDashboardData from './hooks/useDashboardData';
import useElementActions from './hooks/useElementActions';
import { parseElementExtraData } from './utils/elementHelpers';
import { elementService, tarifaService, tarifaMaterialService, companyService, templateOptionsService } from './services/api';

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
    refreshProjects,
    tarifas,
    setTarifas,
    tarifasMateriales,
    setTarifasMateriales,
    companies,
    setCompanies,
    templateOptions,
    setTemplateOptions
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
    deleteProject,
    deleteElemento,
    handleUploadPhoto,
    updateElementPhoto,
    updateElementExtraValue,
    updateElementQuantity,
    updateElementPrice,
    updateElementMeasureValue,
    handleUpdateProject,
    handleProjectFieldChange,
    createElemento,
    exportToExcel,
    handleImportExcel,
    undo,
    canUndo
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
    setStatus,
    money
  });

  const onLogout = () => {
    handleLogout(clearPendingUpdates);
  };

  if (!token) {
    return <Login onLogin={(nombre, password) => handleLogin(nombre, password, setStatus)} error={loginError} />;
  }

  const handleTarifasUpdated = async () => {
    try {
      const [ratesRes, materialsRes, companiesRes, templateOptionsRes] = await Promise.all([
        tarifaService.get(),
        tarifaMaterialService.getAll(),
        companyService.getAll(),
        templateOptionsService.get()
      ]);
      setTarifas(ratesRes.data);
      setTarifasMateriales(materialsRes.data);
      setCompanies(companiesRes.data);
      setTemplateOptions(templateOptionsRes.data);
      
      if (selectedProjectId) {
        const { data: newElements } = await elementService.getAll(selectedProjectId);
        setElementos(newElements);
      }
      await refreshProjects();
    } catch (error) {
      setStatus(`Error al refrescar tras actualizar tarifas: ${error.message}`);
    }
  };

  const handleProjectRestored = async () => {
    try {
      if (selectedProjectId) {
        const { data: newElements } = await elementService.getAll(selectedProjectId);
        setElementos(newElements);
      }
      await refreshProjects();
    } catch (error) {
      setStatus(`Error al refrescar tras restaurar versión: ${error.message}`);
    }
  };

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
            onTarifasUpdated={handleTarifasUpdated}
            tarifasMateriales={tarifasMateriales}
            setTarifasMateriales={setTarifasMateriales}
            companies={companies}
            setCompanies={setCompanies}
            templateOptions={templateOptions}
            setTemplateOptions={setTemplateOptions}
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
            updateElementMeasureValue={updateElementMeasureValue}
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
            tarifas={tarifas}
            tarifasMateriales={tarifasMateriales}
            companies={companies}
            setCompanies={setCompanies}
            templateOptions={templateOptions}
            handleProjectRestored={handleProjectRestored}
            undo={undo}
            canUndo={canUndo}
          />
        )}
      </main>
      {status && <footer className="status-bar" onClick={() => setStatusRaw('')} title="Haga clic para cerrar">{status}</footer>}
    </div>
  );
}

export default App;
