const db = require('../config/db');

const normalizeOptionalInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const projectSelect = `
  SELECT p.*, c.Nombre AS Cliente_Nombre, u.nombre AS Responsable_Nombre,
    colab.nombre AS Colaboradores_Nombre,
    COALESCE(SUM(e.Cantidad * e.Precio), 0) AS Total
  FROM proyectos p
  LEFT JOIN clientes c ON c.id = p.Id_Cliente
  LEFT JOIN usuarios u ON u.id = p.Responsable
  LEFT JOIN usuarios colab ON colab.id = p.Colaboradores
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
    const { Fecha_entrega, Responsable, Id_Cliente } = req.body;
    const nombreProyecto = req.body.proyecto || req.body.Codigo;
    const Colaboradores = normalizeOptionalInteger(req.body.Colaboradores);

    if (!nombreProyecto || !Fecha_entrega || !Responsable || !Id_Cliente) {
      return res.status(400).json({ message: 'El nombre del proyecto (proyecto), Fecha_entrega, Responsable e Id_Cliente son obligatorios' });
    }

    // Fetch client and responsable names to construct the project code
    const [[clientRow]] = await db.query('SELECT Nombre FROM clientes WHERE id = ?', [Id_Cliente]);
    const [[userRow]] = await db.query('SELECT nombre FROM usuarios WHERE id = ?', [Responsable]);

    const firstLetter = (str) => String(str || '').trim().charAt(0).toUpperCase() || 'X';

    const clientChar = firstLetter(clientRow?.Nombre);
    const projectChar = firstLetter(nombreProyecto);
    const respChar = firstLetter(userRow?.nombre);

    const calculatedCodigo = `${clientChar}${projectChar}-${respChar}`;

    const [result] = await db.query(
      'INSERT INTO proyectos (proyecto, Codigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente) VALUES (?, ?, ?, ?, ?, ?)',
      [nombreProyecto, calculatedCodigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente]
    );

    res.status(201).json({
      id: result.insertId,
      proyecto: nombreProyecto,
      Codigo: calculatedCodigo,
      Fecha_entrega,
      Colaboradores,
      Responsable,
      Id_Cliente
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { Fecha_entrega, Responsable, Id_Cliente } = req.body;
    const nombreProyecto = req.body.proyecto || req.body.Codigo;
    const Colaboradores = normalizeOptionalInteger(req.body.Colaboradores);

    if (!nombreProyecto || !Fecha_entrega || !Responsable || !Id_Cliente) {
      return res.status(400).json({ message: 'El nombre del proyecto (proyecto), Fecha_entrega, Responsable e Id_Cliente son obligatorios' });
    }

    const [[clientRow]] = await db.query('SELECT Nombre FROM clientes WHERE id = ?', [Id_Cliente]);
    const [[userRow]] = await db.query('SELECT nombre FROM usuarios WHERE id = ?', [Responsable]);

    const firstLetter = (str) => String(str || '').trim().charAt(0).toUpperCase() || 'X';

    const clientChar = firstLetter(clientRow?.Nombre);
    const projectChar = firstLetter(nombreProyecto);
    const respChar = firstLetter(userRow?.nombre);

    const calculatedCodigo = `${clientChar}${projectChar}-${respChar}`;

    const [result] = await db.query(
      'UPDATE proyectos SET proyecto = ?, Codigo = ?, Fecha_entrega = ?, Colaboradores = ?, Responsable = ?, Id_Cliente = ? WHERE id = ?',
      [nombreProyecto, calculatedCodigo, Fecha_entrega, Colaboradores, Responsable, Id_Cliente, req.params.id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: 'Proyecto no encontrado' });

    res.json({
      id: Number(req.params.id),
      proyecto: nombreProyecto,
      Codigo: calculatedCodigo,
      Fecha_entrega,
      Colaboradores,
      Responsable,
      Id_Cliente
    });
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
