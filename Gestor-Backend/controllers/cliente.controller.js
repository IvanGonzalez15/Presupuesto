const db = require('../models');

const normalizeCliente = (body) => ({
  Nombre: body.Nombre,
  Persona_contacto: body.Persona_contacto || null,
  Email_contacto: body.Email_contacto || null,
  Numero_contacto: body.Numero_contacto || null
});

exports.findAll = async (_req, res, next) => {
  try {
    const clientes = await db.Cliente.findAll({
      order: [['Nombre', 'ASC']]
    });
    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const cliente = await db.Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = normalizeCliente(req.body);
    if (!data.Nombre) {
      return res.status(400).json({ message: 'El campo Nombre es obligatorio' });
    }

    const nuevoCliente = await db.Cliente.create(data);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = normalizeCliente(req.body);
    const [affectedRows] = await db.Cliente.update(data, {
      where: { id: req.params.id }
    });
    
    if (!affectedRows) return res.status(404).json({ message: 'Cliente no encontrado' });
    
    const updatedCliente = await db.Cliente.findByPk(req.params.id);
    res.json(updatedCliente);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deletedCount = await db.Cliente.destroy({
      where: { id: req.params.id }
    });
    
    if (!deletedCount) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
