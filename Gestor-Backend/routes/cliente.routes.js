const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);

// View is allowed for all authenticated roles
router.get('/', clienteController.findAll);
router.get('/:id', clienteController.findOne);

// Modifications are allowed only for Admins
router.post('/', authorizeRoles('Admin'), clienteController.create);
router.put('/:id', authorizeRoles('Admin'), clienteController.update);
router.delete('/:id', authorizeRoles('Admin'), clienteController.remove);

module.exports = router;
