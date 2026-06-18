const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyecto.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);

// View is allowed for all authenticated roles
router.get('/', proyectoController.findAll);
router.get('/:id', proyectoController.findOne);

// Creations and modifications allowed for Admin and Colaborador
router.post('/', authorizeRoles('Admin', 'Colaborador'), proyectoController.create);
router.put('/:id', authorizeRoles('Admin', 'Colaborador'), proyectoController.update);

// Delete projects is Admin only
router.delete('/:id', authorizeRoles('Admin'), proyectoController.remove);

module.exports = router;
