const db = require('../config/db');

const normalizeElemento = (body) => ({
  Nombre: body.Nombre,
  Foto: body.Foto || null,
  Ref: body.Ref,
  Id_usuario_creador: body.Id_usuario_creador,
  Id_proyecto: body.Id_proyecto,
  Cantidad: body.Cantidad,
  Unidad_de_medida: body.Unidad_de_medida,
  Precio: body.Precio,
  medida_metro_cuadrado: body.medida_metro_cuadrado ?? 0,
  medida_metro_cubico: body.medida_metro_cubico ?? 0
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

const firstInitial = (value) => String(value || '').trim().charAt(0).toUpperCase() || 'X';

const createReferencia = async (projectId) => {
  const [[project]] = await db.query(
    `SELECT c.Nombre AS Cliente_Nombre, p.Codigo AS Proyecto_Nombre, u.nombre AS Responsable_Nombre
     FROM proyectos p
     LEFT JOIN clientes c ON c.id = p.Id_Cliente
     LEFT JOIN usuarios u ON u.id = p.Responsable
     WHERE p.id = ?`,
    [projectId]
  );

  if (!project) return null;

  const prefix = `${firstInitial(project.Cliente_Nombre)}${firstInitial(project.Proyecto_Nombre)}${firstInitial(project.Responsable_Nombre)}`;
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM elementos WHERE Id_proyecto = ?', [projectId]);
  return `${prefix}-${total}`;
};

exports.create = async (req, res, next) => {
  try {
    const elemento = normalizeElemento(req.body);
    if (!elemento.Nombre || !elemento.Id_usuario_creador || !elemento.Id_proyecto) {
      return res.status(400).json({ message: 'Nombre, Id_usuario_creador e Id_proyecto son obligatorios' });
    }

    const Ref = await createReferencia(elemento.Id_proyecto);
    if (!Ref) return res.status(404).json({ message: 'Proyecto no encontrado' });
    elemento.Ref = Ref;

    const [result] = await db.query(
      `INSERT INTO elementos
       (Nombre, Foto, Ref, Id_usuario_creador, Id_proyecto, Cantidad, Unidad_de_medida, Precio, medida_metro_cuadrado, medida_metro_cubico)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [elemento.Nombre, elemento.Foto, elemento.Ref, elemento.Id_usuario_creador, elemento.Id_proyecto,
        elemento.Cantidad, elemento.Unidad_de_medida, elemento.Precio, elemento.medida_metro_cuadrado, elemento.medida_metro_cubico]
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
       Cantidad = ?, Unidad_de_medida = ?, Precio = ?, medida_metro_cuadrado = ?, medida_metro_cubico = ? WHERE id = ?`,
      [elemento.Nombre, elemento.Foto, elemento.Ref, elemento.Id_usuario_creador, elemento.Id_proyecto,
        elemento.Cantidad, elemento.Unidad_de_medida, elemento.Precio, elemento.medida_metro_cuadrado,
        elemento.medida_metro_cubico, req.params.id]
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
