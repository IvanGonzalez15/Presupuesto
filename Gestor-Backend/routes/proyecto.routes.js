const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyecto.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);


router.get('/', proyectoController.findAll);
router.get('/:id', proyectoController.findOne);


router.post('/', authorizeRoles('Admin', 'Colaborador'), proyectoController.create);
router.put('/:id', authorizeRoles('Admin', 'Colaborador'), proyectoController.update);


router.delete('/:id', authorizeRoles('Admin'), proyectoController.remove);

module.exports = router;
