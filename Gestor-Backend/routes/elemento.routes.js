const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elemento.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);

// View elements allowed for all roles
router.get('/', elementoController.findAll);
router.get('/:id', elementoController.findOne);

// Write operations (create, update, delete elements) allowed for Admin and Colaborador
router.post('/', authorizeRoles('Admin', 'Colaborador'), elementoController.create);
router.post('/upload', authorizeRoles('Admin', 'Colaborador'), elementoController.uploadPhoto);
router.put('/:id', authorizeRoles('Admin', 'Colaborador'), elementoController.update);
router.delete('/:id', authorizeRoles('Admin', 'Colaborador'), elementoController.remove);

module.exports = router;
