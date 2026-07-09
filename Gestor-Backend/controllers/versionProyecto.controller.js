'use strict';

const { VersionProyecto, Proyecto, Elemento, Usuario } = require('../models');

// Obtener todas las versiones de un proyecto (resumen sin snapshots pesados)
exports.getVersiones = async (req, res, next) => {
  try {
    const { proyectoId } = req.params;

    const versiones = await VersionProyecto.findAll({
      where: { Id_proyecto: proyectoId },
      attributes: ['id', 'version', 'descripcion', 'fecha_creacion', 'creado_por'],
      include: [
        {
          model: Usuario,
          as: 'Creador',
          attributes: ['nombre']
        }
      ],
      order: [['version', 'DESC']]
    });

    res.json(versiones);
  } catch (error) {
    next(error);
  }
};

// Crear una versión congelada del estado actual del proyecto
exports.crearVersion = async (req, res, next) => {
  try {
    const { proyectoId } = req.params;
    const { descripcion } = req.body;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const elementos = await Elemento.findAll({
      where: { Id_proyecto: proyectoId }
    });

    // Encontrar el número máximo de versión actual y sumarle 1
    const maxVersion = await VersionProyecto.max('version', {
      where: { Id_proyecto: proyectoId }
    }) || 0;

    const nuevaVersion = maxVersion + 1;

    // Serializar metadatos del proyecto y partidas actuales
    const proyectoMetadata = {
      proyecto: proyecto.proyecto,
      Fecha_entrega: proyecto.Fecha_entrega,
      Responsable: proyecto.Responsable,
      Id_Cliente: proyecto.Id_Cliente
    };

    const elementosSnapshot = elementos.map(el => ({
      Nombre: el.Nombre,
      Foto: el.Foto,
      Ref: el.Ref,
      Id_usuario_creador: el.Id_usuario_creador,
      Cantidad: Number(el.Cantidad),
      Unidad_de_medida: el.Unidad_de_medida,
      Precio: Number(el.Precio),
      medida_metro_cuadrado: el.medida_metro_cuadrado,
      medida_metro_cubico: el.medida_metro_cubico
    }));

    const versionRecord = await VersionProyecto.create({
      Id_proyecto: proyectoId,
      version: nuevaVersion,
      descripcion: descripcion || `Versión ${nuevaVersion}`,
      creado_por: req.user.id,
      proyecto_metadata: JSON.stringify(proyectoMetadata),
      elementos_snapshot: JSON.stringify(elementosSnapshot)
    });

    res.status(201).json({
      id: versionRecord.id,
      version: versionRecord.version,
      descripcion: versionRecord.descripcion,
      fecha_creacion: versionRecord.fecha_creacion,
      creado_por: versionRecord.creado_por
    });
  } catch (error) {
    next(error);
  }
};

// Restaurar un snapshot de versión
exports.restaurarVersion = async (req, res, next) => {
  try {
    const { proyectoId, versionId } = req.params;

    const versionRecord = await VersionProyecto.findOne({
      where: { id: versionId, Id_proyecto: proyectoId }
    });

    if (!versionRecord) {
      return res.status(404).json({ message: 'Versión no encontrada para este proyecto' });
    }

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // 1. Restaurar metadatos del proyecto
    const metadata = JSON.parse(versionRecord.proyecto_metadata);
    await proyecto.update({
      proyecto: metadata.proyecto,
      Fecha_entrega: metadata.Fecha_entrega,
      Responsable: metadata.Responsable,
      Id_Cliente: metadata.Id_Cliente
    });

    // 2. Eliminar partidas actuales
    await Elemento.destroy({
      where: { Id_proyecto: proyectoId }
    });

    // 3. Restaurar partidas desde el snapshot
    const elementosSnapshot = JSON.parse(versionRecord.elementos_snapshot);
    if (elementosSnapshot.length > 0) {
      const cleanElements = elementosSnapshot.map(el => ({
        ...el,
        Id_proyecto: proyectoId,
        Id_usuario_creador: req.user.id // El que restaura pasa a ser el creador de la nueva instancia
      }));
      await Elemento.bulkCreate(cleanElements);
    }

    res.json({ message: `Versión ${versionRecord.version} restaurada con éxito.` });
  } catch (error) {
    next(error);
  }
};

exports.eliminarVersion = async (req, res, next) => {
  try {
    const { proyectoId, versionId } = req.params;

    const versionRecord = await VersionProyecto.findOne({
      where: { id: versionId, Id_proyecto: proyectoId }
    });

    if (!versionRecord) {
      return res.status(404).json({ message: 'Versión no encontrada para este proyecto' });
    }

    await versionRecord.destroy();
    res.json({ message: `Versión ${versionRecord.version} eliminada correctamente.` });
  } catch (error) {
    next(error);
  }
};
