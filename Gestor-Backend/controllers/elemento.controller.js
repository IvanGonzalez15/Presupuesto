const db = require('../config/db');

const normalizeElemento = (body) => ({
  Nombre: body.Nombre,
  Foto: body.Foto || null,
  Ref: body.Ref,
  Id_usuario_creador: body.Id_usuario_creador,
  Id_proyecto: body.Id_proyecto,
  Cantidad: body.Cantidad,
  Medida: body.Medida,
  Unidad_de_medida: body.Unidad_de_medida,
  Precio: body.Precio
});

exports.findAll = async (req, res, next) => {
  try {
    const params = [];
    let sql = 'SELECT * FROM elementos';
    if (req.query.proyectoId) {
      sql += ' WHERE Id_proyecto = ?';
      params.push(req.query.proyectoId);
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM elementos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Elemento no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const elemento = normalizeElemento(req.body);
    if (!elemento.Nombre || !elemento.Ref || !elemento.Id_usuario_creador || !elemento.Id_proyecto) {
      return res.status(400).json({ message: 'Nombre, Ref, Id_usuario_creador e Id_proyecto son obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO elementos
       (Nombre, Foto, Ref, Id_usuario_creador, Id_proyecto, Cantidad, Medida, Unidad_de_medida, Precio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [elemento.Nombre, elemento.Foto, elemento.Ref, elemento.Id_usuario_creador, elemento.Id_proyecto,
        elemento.Cantidad, elemento.Medida, elemento.Unidad_de_medida, elemento.Precio]
    );
    res.status(201).json({ id: result.insertId, ...elemento });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const elemento = normalizeElemento(req.body);
    const [result] = await db.query(
      `UPDATE elementos SET Nombre = ?, Foto = ?, Ref = ?, Id_usuario_creador = ?, Id_proyecto = ?,
       Cantidad = ?, Medida = ?, Unidad_de_medida = ?, Precio = ? WHERE id = ?`,
      [elemento.Nombre, elemento.Foto, elemento.Ref, elemento.Id_usuario_creador, elemento.Id_proyecto,
        elemento.Cantidad, elemento.Medida, elemento.Unidad_de_medida, elemento.Precio, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Elemento no encontrado' });
    res.json({ id: Number(req.params.id), ...elemento });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM elementos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Elemento no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
