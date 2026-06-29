const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
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

    const user = await db.Usuario.findOne({
      where: { nombre, Activo: 1 }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Update last access timestamp
    user.Ultimo_acceso = new Date();
    await user.save();

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

    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      password_hash,
      rol,
      Activo
    });

    if (String(rol).toLowerCase() === 'colaborador' && proyectoId) {
      const proyecto = await db.Proyecto.findByPk(Number(proyectoId));
      if (proyecto) {
        await proyecto.addColaborador(nuevoUsuario.id);
      }
    }

    res.status(201).json({
      id: nuevoUsuario.id,
      nombre,
      email,
      rol,
      Activo
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
