const db = require('../models');

const normalizeMaterial = (body) => ({
  nombre: body.nombre?.trim(),
  precio_venta: Number(body.precio_venta ?? 0),
  caracteristicas: body.caracteristicas || null,
  notas: body.notas || null
});

exports.findAll = async (_req, res, next) => {
  try {
    const materiales = await db.Material.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(materiales);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const material = await db.Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material no encontrado' });
    res.json(material);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = normalizeMaterial(req.body);
    if (!data.nombre || Number.isNaN(data.precio_venta) || data.precio_venta < 0) {
      return res.status(400).json({ message: 'nombre y precio_venta válido son obligatorios' });
    }

    const nuevoMaterial = await db.Material.create(data);
    res.status(201).json(nuevoMaterial);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = normalizeMaterial(req.body);
    if (!data.nombre || Number.isNaN(data.precio_venta) || data.precio_venta < 0) {
      return res.status(400).json({ message: 'nombre y precio_venta válido son obligatorios' });
    }

    const [affectedRows] = await db.Material.update(data, {
      where: { id: req.params.id }
    });
    
    if (!affectedRows) return res.status(404).json({ message: 'Material no encontrado' });
    
    const updatedMaterial = await db.Material.findByPk(req.params.id);
    res.json(updatedMaterial);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deletedCount = await db.Material.destroy({
      where: { id: req.params.id }
    });
    
    if (!deletedCount) return res.status(404).json({ message: 'Material no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
