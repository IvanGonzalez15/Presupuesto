const db = require('../models');

const normalizeOptionalInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const firstLetter = (str) => String(str || '').trim().charAt(0).toUpperCase() || 'X';

exports.findAll = async (_req, res, next) => {
  try {
    const proyectos = await db.Proyecto.findAll({
      include: [
        { model: db.Cliente, as: 'Cliente' },
        { model: db.Usuario, as: 'UsuarioResponsable' },
        { model: db.Usuario, as: 'Colaboradores' },
        { model: db.Elemento, as: 'Elementos' }
      ],
      order: [['Fecha_entrega', 'DESC']]
    });

    const response = proyectos.map(p => {
      const projJson = p.toJSON();
      
      // Flatten names to match what the frontend expects
      projJson.Cliente_Nombre = projJson.Cliente?.Nombre || '';
      projJson.Responsable_Nombre = projJson.UsuarioResponsable?.nombre || '';
      projJson.Colaboradores_Nombre = (projJson.Colaboradores || []).map(u => u.nombre).join(', ') || 'Ninguno';
      
      // Calculate Total
      const total = (projJson.Elementos || []).reduce(
        (sum, item) => sum + Number(item.Cantidad || 0) * Number(item.Precio || 0),
        0
      );
      projJson.Total = total;
      
      // Remove Elementos to keep payload minimal for the list view
      delete projJson.Elementos;
      
      return projJson;
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const proyecto = await db.Proyecto.findByPk(req.params.id, {
      include: [
        { model: db.Cliente, as: 'Cliente' },
        { model: db.Usuario, as: 'UsuarioResponsable' },
        { model: db.Usuario, as: 'Colaboradores' },
        { model: db.Elemento, as: 'Elementos' }
      ]
    });

    if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });

    const projJson = proyecto.toJSON();
    
    // Flatten names
    projJson.Cliente_Nombre = projJson.Cliente?.Nombre || '';
    projJson.Responsable_Nombre = projJson.UsuarioResponsable?.nombre || '';
    projJson.Colaboradores_Nombre = (projJson.Colaboradores || []).map(u => u.nombre).join(', ') || 'Ninguno';
    projJson.Colaboradores_Ids = (projJson.Colaboradores || []).map(u => u.id);
    
    // Calculate Total
    const total = (projJson.Elementos || []).reduce(
      (sum, item) => sum + Number(item.Cantidad || 0) * Number(item.Precio || 0),
      0
    );
    projJson.Total = total;
    
    // Sort elements by id DESC
    if (projJson.Elementos) {
      projJson.Elementos.sort((a, b) => b.id - a.id);
    }

    res.json(projJson);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { Fecha_entrega, Responsable, Id_Cliente } = req.body;
    const nombreProyecto = req.body.proyecto || req.body.Codigo;
    const ColaboradoresIds = Array.isArray(req.body.Colaboradores) ? req.body.Colaboradores : [];

    if (!nombreProyecto || !Fecha_entrega || !Responsable || !Id_Cliente) {
      return res.status(400).json({ message: 'El nombre del proyecto (proyecto), Fecha_entrega, Responsable e Id_Cliente son obligatorios' });
    }

    const cliente = await db.Cliente.findByPk(Id_Cliente);
    const responsable = await db.Usuario.findByPk(Responsable);

    const clientChar = firstLetter(cliente?.Nombre);
    const projectChar = firstLetter(nombreProyecto);
    const respChar = firstLetter(responsable?.nombre);

    const calculatedCodigo = `${clientChar}${projectChar}-${respChar}`;

    const nuevoProyecto = await db.Proyecto.create({
      proyecto: nombreProyecto,
      Codigo: calculatedCodigo,
      Fecha_entrega,
      Responsable,
      Id_Cliente
    });

    if (ColaboradoresIds.length > 0) {
      await nuevoProyecto.setColaboradores(ColaboradoresIds);
    }

    res.status(201).json(nuevoProyecto);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: `Ya existe un proyecto con el código '${error.fields?.Codigo || 'duplicado'}'. Cambia el nombre del proyecto, el cliente o el responsable para generar un código único.`
      });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { Fecha_entrega, Responsable, Id_Cliente } = req.body;
    const nombreProyecto = req.body.proyecto || req.body.Codigo;
    const ColaboradoresIds = Array.isArray(req.body.Colaboradores) ? req.body.Colaboradores : [];

    if (!nombreProyecto || !Fecha_entrega || !Responsable || !Id_Cliente) {
      return res.status(400).json({ message: 'El nombre del proyecto (proyecto), Fecha_entrega, Responsable e Id_Cliente son obligatorios' });
    }

    const cliente = await db.Cliente.findByPk(Id_Cliente);
    const responsable = await db.Usuario.findByPk(Responsable);

    const clientChar = firstLetter(cliente?.Nombre);
    const projectChar = firstLetter(nombreProyecto);
    const respChar = firstLetter(responsable?.nombre);

    const calculatedCodigo = `${clientChar}${projectChar}-${respChar}`;

    const proyecto = await db.Proyecto.findByPk(req.params.id);
    if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });

    await db.Proyecto.update({
      proyecto: nombreProyecto,
      Codigo: calculatedCodigo,
      Fecha_entrega,
      Responsable,
      Id_Cliente
    }, {
      where: { id: req.params.id }
    });

    await proyecto.setColaboradores(ColaboradoresIds);

    const updatedProyecto = await db.Proyecto.findByPk(req.params.id);
    res.json(updatedProyecto);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: `Ya existe otro proyecto con el código generado. Cambia el nombre del proyecto, el cliente o el responsable para generar un código único.`
      });
    }
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deletedCount = await db.Proyecto.destroy({
      where: { id: req.params.id }
    });
    
    if (!deletedCount) return res.status(404).json({ message: 'Proyecto no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
