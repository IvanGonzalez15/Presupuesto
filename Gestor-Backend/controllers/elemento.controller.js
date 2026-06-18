const db = require('../config/db');
const { parseElementExtraData, calcularPrecioPieza } = require('../helpers/calc.helper');

const normalizeElemento = (body) => {
  const base = {
    Nombre: body.Nombre,
    Foto: body.Foto || null,
    Ref: body.Ref,
    Id_usuario_creador: body.Id_usuario_creador,
    Id_proyecto: body.Id_proyecto,
    Cantidad: Number(body.Cantidad || 1),
    Unidad_de_medida: body.Unidad_de_medida || 'ud',
    Precio: Number(body.Precio || 0),
    medida_metro_cuadrado: Number(body.medida_metro_cuadrado || 0),
    medida_metro_cubico: Number(body.medida_metro_cubico || 0)
  };

  if (base.Foto && base.Foto.trim().startsWith('{')) {
    const extra = parseElementExtraData(base.Foto);
    const calculated = calcularPrecioPieza(extra);
    base.medida_metro_cuadrado = calculated.medida_metro_cuadrado;
    base.medida_metro_cubico = calculated.medida_metro_cubico;
    base.Precio = calculated.precio;
  }

  return base;
};

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

const createReferencia = async (projectId) => {
  const [[project]] = await db.query(
    'SELECT Codigo FROM proyectos WHERE id = ?',
    [projectId]
  );

  if (!project) return null;

  // Count elements associated with this project to obtain sequential ID
  const [[{ count }]] = await db.query(
    'SELECT COUNT(*) AS count FROM elementos WHERE Id_proyecto = ?',
    [projectId]
  );

  const nextNum = count + 1;
  const suffix = String(nextNum).padStart(3, '0');

  return `${project.Codigo}-${suffix}`;
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
