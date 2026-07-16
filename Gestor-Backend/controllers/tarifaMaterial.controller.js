const db = require('../models');
const { parseElementExtraData, calcularPrecioPieza } = require('../helpers/calc.helper');


const recalculateAllElements = async () => {
  const elementos = await db.Elemento.findAll();
  const updates = elementos.map(async (el) => {
    if (el.Foto && el.Foto.trim().startsWith('{')) {
      const extra = parseElementExtraData(el.Foto);
      const calculated = await calcularPrecioPieza(extra, el.Cantidad, el.medida_metro_cuadrado, el.medida_metro_cubico);
      
      if (el.Precio !== calculated.precio || 
          el.medida_metro_cuadrado !== calculated.medida_metro_cuadrado || 
          el.medida_metro_cubico !== calculated.medida_metro_cubico) {
        el.Precio = calculated.precio;
        el.medida_metro_cuadrado = calculated.medida_metro_cuadrado;
        el.medida_metro_cubico = calculated.medida_metro_cubico;
        await el.save();
      }
    }
  });
  await Promise.all(updates);
};

exports.getAll = async (req, res, next) => {
  try {
    const materiales = await db.TarifaMaterial.findAll({
      order: [['categoria', 'ASC'], ['nombre', 'ASC']]
    });
    res.json(materiales);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { categoria, nombre, precio, unidad } = req.body;
    if (!categoria || !nombre || precio === undefined || !unidad) {
      return res.status(400).json({ message: 'Todos los campos (categoria, nombre, precio, unidad) son obligatorios.' });
    }

    const nuevo = await db.TarifaMaterial.create({
      categoria,
      nombre,
      precio: Number(precio),
      unidad
    });

    
    await recalculateAllElements();

    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoria, nombre, precio, unidad } = req.body;
    if (!categoria || !nombre || precio === undefined || !unidad) {
      return res.status(400).json({ message: 'Todos los campos (categoria, nombre, precio, unidad) son obligatorios.' });
    }

    const material = await db.TarifaMaterial.findByPk(id);
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado.' });
    }

    await material.update({
      categoria,
      nombre,
      precio: Number(precio),
      unidad
    });

    
    await recalculateAllElements();

    res.json(material);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    
    const elementos = await db.Elemento.findAll();
    const isUsed = elementos.some(el => {
      if (el.Foto && el.Foto.trim().startsWith('{')) {
        const extra = parseElementExtraData(el.Foto);
        return extra.materials && (
          Number(extra.materials.porexId) === numericId ||
          Number(extra.materials.linexId) === numericId ||
          Number(extra.materials.fibraId) === numericId ||
          Number(extra.materials.pinturaId) === numericId ||
          Number(extra.materials.morteroId) === numericId
        );
      }
      return false;
    });

    if (isUsed) {
      return res.status(400).json({ message: 'No se puede eliminar este material porque está en uso en uno o más presupuestos.' });
    }

    const material = await db.TarifaMaterial.findByPk(id);
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado.' });
    }

    await material.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
