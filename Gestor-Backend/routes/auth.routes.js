const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const hashPasswordMiddleware = require('../middlewares/bcrypt.middleware');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res, next) => {
  try {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña obligatorios' });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE nombre = ? AND Activo = 1', [nombre]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    await db.query('UPDATE usuarios SET Ultimo_acceso = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, nombre: user.nombre, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    next(error);
  }
});

// Register route restricted to Admin only for creating new users securely
router.post('/register', authenticateToken, authorizeRoles('Admin'), hashPasswordMiddleware, async (req, res, next) => {
  try {
    const { nombre, email = null, password_hash, rol, Activo = 1, proyectoId } = req.body;
    if (!nombre || !password_hash || !rol) {
      return res.status(400).json({ message: 'nombre, password y rol son obligatorios' });
    }

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, Activo) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, password_hash, rol, Activo]
    );

    const newUserId = result.insertId;

    if (String(rol).toLowerCase() === 'colaborador' && proyectoId) {
      await db.query(
        'UPDATE proyectos SET Colaboradores = ? WHERE id = ?',
        [newUserId, Number(proyectoId)]
      );
    }

    res.status(201).json({ id: newUserId, nombre, email, rol, Activo });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
