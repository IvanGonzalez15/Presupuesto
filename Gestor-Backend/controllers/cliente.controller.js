const db = require('../config/db');

const requireAdministrador = async (req, res) => {
  const userId = req.get('x-user-id');
  if (!userId) {
    res.status(403).json({ message: 'Selecciona un usuario Administrador para realizar esta acción' });
    return null;
  }

  const [[usuario]] = await db.query('SELECT id, rol FROM usuarios WHERE id = ?', [userId]);
  if (!usuario || usuario.rol !== 'Administrador') {
    res.status(403).json({ message: 'Solo los Administradores pueden crear clientes y proyectos' });
    return null;
  }

  return usuario;
};

const normalizeCliente = (body) => ({
  id: body.id,
  Nombre: body.Nombre,
  Persona_contacto: body.Persona_contacto || null,
  Email_contacto: body.Email_contacto || null,
  Numero_contacto: body.Numero_contacto || null
});

exports.findAll = async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY Nombre ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!(await requireAdministrador(req, res))) return;

    const cliente = normalizeCliente(req.body);
    if (!cliente.id || !cliente.Nombre) {
      return res.status(400).json({ message: 'Los campos id y Nombre son obligatorios' });
    }

    await db.query(
      'INSERT INTO clientes (id, Nombre, Persona_contacto, Email_contacto, Numero_contacto) VALUES (?, ?, ?, ?, ?)',
      [cliente.id, cliente.Nombre, cliente.Persona_contacto, cliente.Email_contacto, cliente.Numero_contacto]
    );
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const cliente = normalizeCliente({ ...req.body, id: req.params.id });
    const [result] = await db.query(
      'UPDATE clientes SET Nombre = ?, Persona_contacto = ?, Email_contacto = ?, Numero_contacto = ? WHERE id = ?',
      [cliente.Nombre, cliente.Persona_contacto, cliente.Email_contacto, cliente.Numero_contacto, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
