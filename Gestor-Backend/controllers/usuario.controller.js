const db = require('../config/db');

exports.findAll = async (_req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, rol, Activo, Ultimo_acceso, Created_At, Updated_At FROM usuarios ORDER BY nombre ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, rol, Activo, Ultimo_acceso, Created_At, Updated_At FROM usuarios WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
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

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, Activo) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, password_hash, rol, Activo]
    );
    res.status(201).json({ id: result.insertId, nombre, email, rol, Activo });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { nombre, email = null, password_hash, rol, Activo = 1 } = req.body;
    
    if (password_hash) {
      const [result] = await db.query(
        'UPDATE usuarios SET nombre = ?, email = ?, password_hash = ?, rol = ?, Activo = ? WHERE id = ?',
        [nombre, email, password_hash, rol, Activo, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado' });
    } else {
      const [result] = await db.query(
        'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, Activo = ? WHERE id = ?',
        [nombre, email, rol, Activo, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ id: Number(req.params.id), nombre, email, rol, Activo });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
