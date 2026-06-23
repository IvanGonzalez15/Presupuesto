const db = require('../models');

exports.findAll = async (_req, res, next) => {
  try {
    const usuarios = await db.Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['nombre', 'ASC']]
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const usuario = await db.Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nombre, email = null, password_hash, rol, Activo = 1 } = req.body;
    if (!nombre || !password_hash || !rol) {
      return res.status(400).json({ message: 'nombre, password_hash y rol son obligatorios' });
    }

    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      password_hash,
      rol,
      Activo
    });

    const respuesta = nuevoUsuario.toJSON();
    delete respuesta.password_hash;
    res.status(201).json(respuesta);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { nombre, email = null, password_hash, rol, Activo = 1 } = req.body;
    
    const updateData = { nombre, email, rol, Activo };
    if (password_hash) {
      updateData.password_hash = password_hash;
    }

    const [affectedRows] = await db.Usuario.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (!affectedRows) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    const updatedUsuario = await db.Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    res.json(updatedUsuario);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deletedCount = await db.Usuario.destroy({
      where: { id: req.params.id }
    });
    
    if (!deletedCount) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
