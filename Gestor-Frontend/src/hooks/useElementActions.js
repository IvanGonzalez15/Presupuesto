import { useRef } from 'react';
import { parseElementExtraData, serializeElementExtraData } from '../utils/elementHelpers';
import { exportToExcel as exportToExcelHelper, handleImportExcel as handleImportExcelHelper } from '../utils/excelHelper';
import { authService, clientService, projectService, elementService, materialService, userService } from '../services/api';

export default function useElementActions({
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
}) {
  const pendingUpdates = useRef({});

  const clearPendingUpdates = () => {
    Object.values(pendingUpdates.current).forEach(clearTimeout);
    pendingUpdates.current = {};
  };

  const handleUserCreate = async (newUser) => {
    try {
      await authService.register(newUser);
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAll(),
        projectService.getAll()
      ]);
      setUsuarios(usersRes.data);
      setProyectos(projectsRes.data);
      setStatus(`Usuario ${newUser.nombre} registrado correctamente.`);
    } catch (error) {
      setStatus(`No se pudo crear el usuario: ${error.response?.data?.message || error.message}`);
    }
  };

  const createCliente = async (clientDraft) => {
    try {
      const { data } = await clientService.create(clientDraft);
      setClientes((current) => [...current, data].sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
      setStatus(`Cliente ${data.Nombre} creado.`);
    } catch (error) {
      setStatus(`No se pudo crear el cliente: ${error.response?.data?.message || error.message}`);
    }
  };

  const createProyecto = async (projectDraft) => {
    try {
      const payload = {
        ...projectDraft,
        Colaboradores: projectDraft.Colaboradores ? Number(projectDraft.Colaboradores) : null,
        Responsable: Number(projectDraft.Responsable),
        Id_Cliente: Number(projectDraft.Id_Cliente),
      };
      const { data } = await projectService.create(payload);
      const refreshed = await refreshProjects();
      setSelectedProjectId(String(data.id));
      setStatus(`Proyecto ${refreshed.find((project) => project.id === data.id)?.Codigo || data.Codigo} creado.`);
    } catch (error) {
      setStatus(`No se pudo crear el proyecto: ${error.response?.data?.message || error.message}`);
    }
  };

  const saveMaterial = async (materialDraft, editingMaterialId) => {
    if (!isAdmin) {
      setStatus('Solo los administradores pueden crear o editar materiales.');
      return;
    }

    const payload = {
      ...materialDraft,
      precio_venta: Number(materialDraft.precio_venta),
    };

    try {
      if (editingMaterialId) {
        const { data } = await materialService.update(editingMaterialId, payload);
        setMateriales((current) => current.map((material) => (material.id === data.id ? data : material)).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setStatus(`Material ${data.nombre} actualizado.`);
      } else {
        const { data } = await materialService.create(payload);
        setMateriales((current) => [...current, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setStatus(`Material ${data.nombre} creado.`);
      }
    } catch (error) {
      setStatus(`No se pudo guardar el material: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteMaterial = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Seguro que quieres eliminar este material?')) return;
    try {
      await materialService.delete(id);
      setMateriales((current) => current.filter((m) => m.id !== id));
      setStatus('Material eliminado.');
    } catch (error) {
      setStatus(`No se pudo eliminar el material: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteProject = async (id) => {
    if (!isAdmin) {
      setStatus('Solo los administradores pueden eliminar proyectos.');
      return;
    }
    if (!window.confirm('¿Seguro que quieres eliminar este proyecto y todos sus elementos?')) return;
    try {
      await projectService.delete(id);
      setProyectos((current) => current.filter((p) => p.id !== id));
      setElementos((current) => current.filter((e) => e.Id_proyecto !== id));
      if (String(selectedProjectId) === String(id)) setSelectedProjectId('');
      setStatus('Proyecto eliminado.');
    } catch (error) {
      setStatus(`No se pudo eliminar el proyecto: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteElemento = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta partida?')) return;
    try {
      await elementService.delete(id);
      setElementos((current) => current.filter((e) => e.id !== id));
      await refreshProjects();
      setStatus('Partida eliminada.');
    } catch (error) {
      setStatus(`No se pudo eliminar la partida: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUploadPhoto = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result;
          const { data } = await elementService.uploadPhoto(base64Data, file.name);
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const updateElementPhoto = async (item, photoUrl) => {
    try {
      const extra = parseElementExtraData(item);
      extra.fotoUrl = photoUrl;
      const serialized = serializeElementExtraData(extra);
      const payload = { ...item, Foto: serialized };
      await elementService.update(item.id, payload);
      setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Foto: serialized } : e));
      setStatus('Foto de la partida actualizada.');
    } catch (err) {
      setStatus(`Error al actualizar la foto: ${err.message}`);
    }
  };

  const exportToExcel = () => {
    exportToExcelHelper(selectedProject, projectItems, setStatus, money);
  };

  const handleImportExcel = (event) => {
    handleImportExcelHelper(event, selectedProjectId, currentUser, refreshProjects, setElementos, setStatus);
  };

  const queueElementUpdate = (itemId, updateFn) => {
    if (pendingUpdates.current[itemId]) {
      clearTimeout(pendingUpdates.current[itemId]);
    }
    pendingUpdates.current[itemId] = setTimeout(async () => {
      await updateFn();
      delete pendingUpdates.current[itemId];
    }, 800);
  };

  const updateElementExtraValue = (item, fieldGroup, key, val) => {
    const extra = parseElementExtraData(item);
    if (fieldGroup === 'materials') {
      extra.materials[key] = val;
    } else if (fieldGroup === 'hours') {
      extra.hours[key] = val;
    } else {
      extra[key] = val;
    }

    if (key === 'largo' || key === 'ancho' || key === 'alto') {
      extra[key] = Number(val || 0);
    }

    const updatedFoto = serializeElementExtraData(extra);
    
    setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Foto: updatedFoto } : e));

    queueElementUpdate(item.id, async () => {
      try {
        const payload = {
          ...item,
          Foto: updatedFoto
        };
        const { data } = await elementService.update(item.id, payload);
        
        setElementos((current) => current.map((e) => e.id === item.id ? { 
          ...e, 
          Foto: data.Foto, 
          Precio: data.Precio, 
          medida_metro_cuadrado: data.medida_metro_cuadrado, 
          medida_metro_cubico: data.medida_metro_cubico 
        } : e));
        await refreshProjects();
      } catch (err) {
        setStatus(`Error al actualizar partida: ${err.message}`);
      }
    });
  };

  const updateElementQuantity = (item, qty) => {
    const numericQty = Number(qty);
    setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Cantidad: numericQty } : e));

    queueElementUpdate(item.id, async () => {
      try {
        const payload = { ...item, Cantidad: numericQty };
        await elementService.update(item.id, payload);
        await refreshProjects();
      } catch (err) {
        setStatus(`Error al actualizar cantidad: ${err.message}`);
      }
    });
  };

  const updateElementPrice = (item, price) => {
    const numericPrice = Number(price);
    setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Precio: numericPrice } : e));

    queueElementUpdate(item.id, async () => {
      try {
        const payload = { ...item, Precio: numericPrice };
        await elementService.update(item.id, payload);
        await refreshProjects();
      } catch (err) {
        setStatus(`Error al actualizar precio unitario: ${err.message}`);
      }
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Codigo: selectedProject.Codigo,
        Fecha_entrega: selectedProject.Fecha_entrega,
        Responsable: Number(selectedProject.Responsable),
        Id_Cliente: Number(selectedProject.Id_Cliente),
        Colaboradores: selectedProject.Colaboradores ? Number(selectedProject.Colaboradores) : null
      };
      await projectService.update(selectedProject.id, payload);
      await refreshProjects();
      setStatus('Datos del proyecto actualizados.');
    } catch (err) {
      setStatus(`Error al actualizar proyecto: ${err.message}`);
    }
  };

  const handleProjectFieldChange = (field, value) => {
    setProyectos((current) => current.map((p) => p.id === selectedProject.id ? { ...p, [field]: value } : p));
  };

  const createElemento = async (itemDraft) => {
    if (!selectedProjectId) {
      setStatus('Selecciona o crea un proyecto antes de añadir una partida.');
      return;
    }

    const payload = {
      ...itemDraft,
      Id_proyecto: Number(selectedProjectId),
      Id_usuario_creador: currentUser?.id || 1,
      Cantidad: Number(itemDraft.Cantidad),
      Precio: Number(itemDraft.Precio),
      medida_metro_cuadrado: Number(itemDraft.medida_metro_cuadrado),
      medida_metro_cubico: Number(itemDraft.medida_metro_cubico),
    };

    try {
      const { data } = await elementService.create(payload);
      setElementos((current) => [data, ...current]);
      await refreshProjects();
      setStatus('Partida añadida al presupuesto');
    } catch (error) {
      setStatus(`No se pudo guardar la partida: ${error.response?.data?.message || error.message}`);
    }
  };

  return {
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
  };
}
