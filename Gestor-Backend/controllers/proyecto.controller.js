const db = require('../config/db');


const normalizeOptionalInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const projectSelect = `
  SELECT p.*, c.Nombre AS Cliente_Nombre, u.nombre AS Responsable_Nombre,
    COALESCE(SUM(e.Cantidad * e.Medida * e.Precio), 0) AS Total
  FROM proyectos p
  LEFT JOIN clientes c ON c.id = p.Id_Cliente
  LEFT JOIN usuarios u ON u.id = p.Responsable
  LEFT JOIN elementos e ON e.Id_proyecto = p.id
`;

exports.findAll = async (_req, res, next) => {
  try {
    const [rows] = await db.query(`${projectSelect} GROUP BY p.id ORDER BY p.Fecha_entrega DESC`);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const [[project]] = await db.query(`${projectSelect} WHERE p.id = ? GROUP BY p.id`, [req.params.id]);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

    const [elementos] = await db.query('SELECT * FROM elementos WHERE Id_proyecto = ? ORDER BY id DESC', [req.params.id]);
    res.json({ ...project, Elementos: elementos });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {

    const { Codigo, Fecha_entrega, Responsable, Id_Cliente } = req.body;
    const Colaboradores = normalizeOptionalInteger(req.body.Colaboradores);
    if (!Codigo || !Fecha_entrega || !Responsable || !Id_Cliente) {
      return res.status(400).json({ message: 'Codigo, Fecha_entrega, Responsable e Id_Cliente son obligatorios' });
    }

    const [result] = await db.query(
      'INSERT INTO proyectos (Codigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente) VALUES (?, ?, ?, ?, ?)',
      [Codigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente]
    );
    res.status(201).json({ id: result.insertId, Codigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { Codigo, Fecha_entrega, Responsable, Id_Cliente } = req.body;
    const Colaboradores = normalizeOptionalInteger(req.body.Colaboradores);
    const [result] = await db.query(
      'UPDATE proyectos SET Codigo = ?, Fecha_entrega = ?, Colaboradores = ?, Responsable = ?, Id_Cliente = ? WHERE id = ?',
      [Codigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Proyecto no encontrado' });
    res.json({ id: Number(req.params.id), Codigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM proyectos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Proyecto no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
