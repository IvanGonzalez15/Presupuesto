const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const hashPasswordMiddleware = require('../middlewares/bcrypt.middleware');

router.use(authenticateToken);

// Read — allowed for all authenticated roles
router.get('/', usuarioController.findAll);
router.get('/:id', usuarioController.findOne);

// Update and delete are Admin only
// Note: Creating users must go through POST /api/auth/register (handles project association)
router.put('/:id', authorizeRoles('Admin'), hashPasswordMiddleware, usuarioController.update);
router.delete('/:id', authorizeRoles('Admin'), usuarioController.remove);

module.exports = router;

