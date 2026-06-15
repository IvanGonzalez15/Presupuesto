const db = require('../config/db');

const normalizeMaterial = (body) => ({
  nombre: body.nombre?.trim(),
  precio_venta: Number(body.precio_venta ?? 0),
  caracteristicas: body.caracteristicas || null,
  notas: body.notas || null
});

const ensureAdmin = async (req, res, next) => {
  try {
    const userId = req.header('x-user-id') || req.query.userId || req.body.userId;
    if (!userId) return res.status(403).json({ message: 'Solo los administradores pueden modificar materiales' });

    const [[user]] = await db.query('SELECT id, rol FROM usuarios WHERE id = ? AND Activo = 1', [userId]);
    if (!user || !['admin', 'administrador'].includes(String(user.rol).toLowerCase())) {
      return res.status(403).json({ message: 'Solo los administradores pueden modificar materiales' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

exports.ensureAdmin = ensureAdmin;

exports.findAll = async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM materiales ORDER BY nombre ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM materiales WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Material no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const material = normalizeMaterial(req.body);
    if (!material.nombre || Number.isNaN(material.precio_venta) || material.precio_venta < 0) {
      return res.status(400).json({ message: 'nombre y precio_venta válido son obligatorios' });
    }

    const [result] = await db.query(
      'INSERT INTO materiales (nombre, precio_venta, caracteristicas, notas) VALUES (?, ?, ?, ?)',
      [material.nombre, material.precio_venta, material.caracteristicas, material.notas]
    );
    res.status(201).json({ id: result.insertId, ...material });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const material = normalizeMaterial(req.body);
    if (!material.nombre || Number.isNaN(material.precio_venta) || material.precio_venta < 0) {
      return res.status(400).json({ message: 'nombre y precio_venta válido son obligatorios' });
    }

    const [result] = await db.query(
      'UPDATE materiales SET nombre = ?, precio_venta = ?, caracteristicas = ?, notas = ? WHERE id = ?',
      [material.nombre, material.precio_venta, material.caracteristicas, material.notas, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Material no encontrado' });
    res.json({ id: Number(req.params.id), ...material });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM materiales WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Material no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
